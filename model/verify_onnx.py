from pathlib import Path

import numpy as np
import onnxruntime as ort
import torch

from main import Net, testset

MODEL_DIR = Path(__file__).resolve().parent
WEIGHTS_PATH = MODEL_DIR / "MNIST_net.pt"
ONNX_PATH = MODEL_DIR / "model.onnx"
NUM_IMAGES = 10

net = Net()
net.load_state_dict(torch.load(WEIGHTS_PATH, map_location="cpu", weights_only=True))
net.eval()

session = ort.InferenceSession(ONNX_PATH, providers=["CPUExecutionProvider"])

all_match = True
for i in range(NUM_IMAGES):
    image, label = testset[i]          # already normalized, shape (1, 28, 28)
    batch = image.unsqueeze(0)         # add batch dimension -> (1, 1, 28, 28)

    with torch.no_grad():
        torch_logits = net(batch).numpy()
    onnx_logits = session.run(["logits"], {"input": batch.numpy()})[0]

    match = np.allclose(torch_logits, onnx_logits, atol=1e-5)
    all_match = all_match and match
    print(f"Image {i}: label={label} torch={torch_logits.argmax()} "
          f"onnx={onnx_logits.argmax()} match={match}")

print(f"Outputs match: {all_match}")
