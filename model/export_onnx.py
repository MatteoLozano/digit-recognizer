from pathlib import Path

import torch

from main import Net

MODEL_DIR = Path(__file__).resolve().parent
WEIGHTS_PATH = MODEL_DIR / "MNIST_net.pt"
ONNX_PATH = MODEL_DIR / "model.onnx"

# Load the trained weights into a fresh network (on CPU, whatever device it was trained on)
net = Net()
net.load_state_dict(torch.load(WEIGHTS_PATH, map_location="cpu", weights_only=True))
net.eval()

# Example input that fixes the input shape: 1 image, 1 channel, 28x28 pixels
dummy_input = torch.zeros(1, 1, 28, 28)

torch.onnx.export(
    net,
    (dummy_input,),
    ONNX_PATH,
    input_names=["input"],
    output_names=["logits"],
    opset_version=18,      # supported by ONNX Runtime 1.22 used in the backend
    external_data=False,   # embed the weights in model.onnx (no separate .onnx.data file)
    dynamo=True,
)

print(f"Exported {ONNX_PATH} ({ONNX_PATH.stat().st_size / 1024:.0f} KB)")
