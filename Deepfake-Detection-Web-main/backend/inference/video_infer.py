import json
import sys
import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import warnings
from torchvision.transforms import Normalize
import torchvision.models as models
warnings.filterwarnings("ignore") #ignore all unecessary warnings to focus on important informations


#start of the code
class MyResNeXt(models.resnet.ResNet):
    def __init__(self, training=True):
        super(MyResNeXt, self).__init__(block=models.resnet.Bottleneck,
                                        layers=[3, 4, 6, 3], 
                                        groups=32, 
                                        width_per_group=4)
        self.fc = nn.Linear(2048, 1)
#parameters declaration
gpu = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
input_size = 224
mean = [0.485, 0.456, 0.406]
std = [0.229, 0.224, 0.225]
normalize_transform = Normalize(mean, std)
def isotropically_resize_image(img, size, resample=cv2.INTER_AREA):
    h, w = img.shape[:2]
    if w > h:
        h = h * size // w
        w = size
    else:
        w = w * size // h
        h = size

    resized = cv2.resize(img, (w, h), interpolation=resample)
    return resized


def make_square_image(img):
    h, w = img.shape[:2]
    size = max(h, w)
    t = 0
    b = size - h
    l = 0
    r = size - w
    return cv2.copyMakeBorder(img, t, b, l, r, cv2.BORDER_CONSTANT, value=0)

checkpoint = torch.load(r"C:\Users\dmin\HUST\20242\Project2\Deepfake-Detection-Web-main\backend\inference\resnext_video.pth", map_location=gpu)

model = MyResNeXt().to(gpu)
model.load_state_dict(checkpoint, strict= False) #rn model is not strict, so we can load the model without matching the keys in the state_dict
_ = model.eval()




def infer_video(file_path):
    """
    Perform inference on a video file to detect deepfakes.

    Args:
        file_path (str): Path to the video file.

    Returns:
        dict: A dictionary containing fake and real probabilities.
    """
    # Load the video
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        raise ValueError(f"Unable to open video file: {file_path}")

    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        # Preprocess the frame
        frame = isotropically_resize_image(frame, input_size)
        frame = make_square_image(frame)
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame = np.transpose(frame, (2, 0, 1))  # HWC to CHW
        frame = frame / 255.0  # Normalize to [0, 1]
        frame = normalize_transform(torch.tensor(frame).float())
        frames.append(frame)

    cap.release()

    # Stack frames into a batch
    if len(frames) == 0:
        raise ValueError("No frames were extracted from the video.")
    batch = torch.stack(frames).to(gpu)

    # Perform inference
    with torch.no_grad():
        outputs = model(batch)
        probabilities = torch.sigmoid(outputs).cpu().numpy()

    # Calculate average probabilities
    fake_probability = float(np.mean(probabilities))
    real_probability = 1.0 - fake_probability

    
    result = {"fake_probability": fake_probability, "real_probability": real_probability}
    return result

if __name__ == "__main__":
    file_path = sys.argv[1]
    result = infer_video(file_path)
    print(json.dumps(result))