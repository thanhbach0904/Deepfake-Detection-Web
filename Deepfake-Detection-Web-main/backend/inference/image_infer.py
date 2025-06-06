import json
import sys
import warnings
import torch
from torch import nn
import cv2
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import torchvision.models as models
from torchvision.models import ResNet50_Weights
from torchvision import transforms
import os
warnings.filterwarnings("ignore") #ignore all unecessary warnings to focus on important informations

class ResNet50Classifier(nn.Module):
    def __init__(self, num_classes=2, pretrained=True):
        super(ResNet50Classifier, self).__init__()
        if pretrained:
            self.backbone = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)
        else:
            self.backbone = models.resnet50(weights=None)
        
        # Replace the final fully connected layer
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )
    
    def forward(self, x):
        return self.backbone(x)
device = (
    "cuda"
    if torch.cuda.is_available()
    else "mps"
    if torch.backends.mps.is_available()
    else "cpu"
)
num_classes = 2
img_size = 224
base_transform = transforms.Compose([
    transforms.Resize((img_size, img_size)),
    transforms.ToTensor()
])

model = ResNet50Classifier(num_classes=num_classes, pretrained=False)
model.to(device)
file_dir = os.path.dirname(os.path.abspath(__file__))
model_name = "cifake_resNet_98.45.pth"
model_path = os.path.join(file_dir, model_name)
checkpoint = torch.load(model_path)

model.load_state_dict(checkpoint)
_ = model.eval()

def infer_image(file_path):
    image = cv2.imread(file_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) # Convert BGR to RGB as PyTorch models usually expect RGB
    image = Image.fromarray(image) # Convert to PIL Image for transforms

    transformed_image = base_transform(image).unsqueeze(0)  # Add batch dimension
    transformed_image = transformed_image.to(device)

    with torch.no_grad():
        outputs = model(transformed_image)
        probabilities = F.softmax(outputs, dim=1)
        real_probability = probabilities[0][1].item() #class 1 is 'real'
        fake_probability = probabilities[0][0].item() #class 0 is 'fake'

    result = {"fake_probability": fake_probability, "real_probability": real_probability}
    return result

if __name__ == "__main__":
    file_path = sys.argv[1]
    result = infer_image(file_path)
    print(json.dumps(result))