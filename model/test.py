import torch
import torchvision
import matplotlib.pyplot as plt
import numpy as np
from main import Net, testloader, classes

PATH = "./MNIST_net.pt"

def imshow(img):
    img = img * 0.3081 + 0.1307           # undo Normalize([0.5], [0.5])
    plt.imshow(np.transpose(img.numpy(), (1, 2, 0)))
    plt.show()


net = Net()
net.load_state_dict(torch.load(PATH, weights_only = True))
net.eval()

Total = 0
Correct = 0


for i, data in enumerate(testloader, 0):
    images, labels = data
    with torch.no_grad():
        outputs = net(images)
        _, predicted = torch.max(outputs, 1)
        Total += len(predicted)
        Correct += (predicted == labels).sum()

print(f"Correct: {Correct}/{Total}\nAccuracy = {Correct/Total * 100}%")
    
