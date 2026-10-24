import torch
import torchvision
from torchvision.transforms import v2
import matplotlib.pyplot as plt
import numpy as np
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from pathlib import Path

# Resolve data/ next to this file, so it works no matter where the script is run from
DATA_DIR = Path(__file__).resolve().parent / "data"

transform = v2.Compose([
    v2.ToImage(),
    v2.ToDtype(torch.float32, scale=True),
    v2.Normalize([0.1307], [0.3081])])

batch_size = 64

trainset = torchvision.datasets.MNIST(root=DATA_DIR, train=True,
                                        download=True, transform=transform)
trainloader = torch.utils.data.DataLoader(trainset, batch_size=batch_size,
                                          shuffle=True, num_workers=0)
testset = torchvision.datasets.MNIST(root=DATA_DIR, train=False,
                                       download=True, transform=transform)
testloader = torch.utils.data.DataLoader(testset, batch_size=batch_size,
                                         shuffle=False, num_workers=0)

classes = ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9")

#=============>Define the CNN<==================
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, 3)  
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.pool = nn.MaxPool2d(2, 2) #shrink data every 2  blocks max is picked
        self.fc1 = nn.Linear(64 * 5 * 5, 128) #self.fc1 = nn.Linear(32*13*13, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, input):
        C1 = F.relu(self.conv1(input)) #Convolution Layer
        S1 = self.pool(C1) #Subsampling layer
        C2 = F.relu(self.conv2(S1))
        S2 = self.pool(C2)
        S_flattened = S2.flatten(1)
        f1 = F.relu(self.fc1(S_flattened)) #first fully connected layer
        f2 = self.fc2(f1) #no relu because end
        return f2

# 1. pick the device (falls back to CPU if there is no GPU)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

net = Net().to(device)
params = list(net.parameters())
#print(len(params))
#print(params[5].size()) 
criterion = nn.CrossEntropyLoss()
#optimizer = optim.SGD(net.parameters(), lr=0.001, momentum=0.9)
optimizer = optim.Adam(net.parameters(), lr=1e-3)

#=====================>Train the network<============================================
if __name__ == "__main__":
    print('Using', device)
    for epoch in range(5):
        running_loss = 0.0
        for i, data in enumerate(trainloader, 0):
            inputs, labels = data # get the inputs; data is a list of [inputs, labels]
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad() # zero the parameter gradients

            outputs = net(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            # print statistics
            running_loss += loss.item()
            if i % 100 == 99:    # print every 2000 mini-batches
                print(f'[{epoch + 1}, {i + 1:5d}] loss: {running_loss / 100:.3f}')
                running_loss = 0.0
                
    print('Finished Training')

    #save trained model
    PATH = './MNIST_net.pt'
    torch.save(net.state_dict(), PATH)






"""#===============>Show some imagess<=============
# functions to show an image
def imshow(img):
    img = img / 2 + 0.5     # unnormalize
    np_img = img.numpy()
    plt.imshow(np.transpose(np_img, (1, 2, 0)))
    plt.show()

# get some random training images
data_iter = iter(trainloader)
images, labels = next(data_iter)

# show images
imshow(torchvision.utils.make_grid(images))
# print labels
print(' '.join(f'{classes[labels[j]]:5s}' for j in range(batch_size)))
"""