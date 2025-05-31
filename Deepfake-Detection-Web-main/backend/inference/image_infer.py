import json
import sys
import cv2
import torch
import torch.nn as nn
import torch.nn.functional as F
import warnings
from torchvision import transforms
from PIL import Image
warnings.filterwarnings("ignore") #ignore all unecessary warnings to focus on important informations

num_classes = 2
img_size = 224
base_transform = transforms.Compose([
    transforms.Resize((img_size, img_size)),
    transforms.ToTensor()
])

class CNNClassification(nn.Module):
    def __init__(self,num_classes):
        super(CNNClassification, self).__init__()
        
        self.CNN_Model = nn.Sequential(
            # Block 1: Two Conv layers + Pooling
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, stride=2),  # Output: 112x112x32

            # Block 2: Two Conv layers + Pooling
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2, stride=2),  # Output: 56x56x64

            # Block 3: Three Conv layers + Pooling
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2, stride=2),  # Output: 28x28x128

            # Block 4: Three Conv layers + Pooling
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d(2, stride=2),  # Output: 14x14x256

            # Block 5: Three Conv layers + Pooling with 256 filters
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d(2, stride=2),  # Output: 7x7x256


            nn.Flatten(),  
            nn.Dropout(0.3),
            nn.Linear(256 * 7 * 7, 2048),  
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(2048, 1024),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(1024, num_classes) 
        )

    def forward(self, x):
        return self.CNN_Model(x)

Cnn_model = CNNClassification(num_classes= num_classes)
device = (
    "cuda"
    if torch.cuda.is_available()
    else "mps"
    if torch.backends.mps.is_available()
    else "cpu"
)
Cnn_model.to(device)
checkpoint = torch.load(r"C:\Users\dmin\HUST\20242\Project2\Deepfake-Detection-Web-main\backend\inference\Deepfake_Detection_Image_80accu.pth")
Cnn_model.load_state_dict(checkpoint)
_ = Cnn_model.eval()

def infer_image(file_path):
    image = cv2.imread(file_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) # Convert BGR to RGB as PyTorch models usually expect RGB
    image = Image.fromarray(image) # Convert to PIL Image for transforms

    transformed_image = base_transform(image).unsqueeze(0)  # Add batch dimension
    transformed_image = transformed_image.to(device)

    with torch.no_grad():
        outputs = Cnn_model(transformed_image)
        probabilities = F.softmax(outputs, dim=1)
        real_probability = probabilities[0][1].item() #class 1 is 'real'
        fake_probability = probabilities[0][0].item() #class 0 is 'fake'

    result = {"fake_probability": fake_probability, "real_probability": real_probability}
    return result

if __name__ == "__main__":
    file_path = sys.argv[1]
    result = infer_image(file_path)
    print(json.dumps(result))