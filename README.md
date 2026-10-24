# Digit Recognizer

Draw a digit from 0 to 9 in the browser and a neural network guesses it live as you draw.

<p align="center">
  <img src="docs/DigitRecGif.gif" width="700" alt="Drawing digits on the canvas while the prediction updates live">
</p>
https://github.com/user-attachments/assets/371c3974-fc68-4fb8-8989-0b86e43456f1

## How I built it

**1. Training the model (PyTorch).**
First, I trained a small convolutional neural network separately in Python with PyTorch, using the MNIST dataset of 60,000 handwritten digits. It reaches about **99% accuracy** on the 10,000 test images. The trained weights are saved as a `.pt` file.

**2. Exporting it with ONNX.**
A `.pt` file can only be loaded by PyTorch in Python, but my backend is written in Java. So I exported the already trained model to **ONNX**, an open format for machine learning models. With the ONNX Runtime library, the backend runs the model directly in Java, without needing Python.

**3. The web app.**
- **Frontend (Next.js):** you draw on a canvas. The drawing is scaled down to 28×28 pixels and sent to the backend.
- **Backend (Spring Boot):** receives the 784 pixel values, prepares them the same way as during training, runs the ONNX model, and returns the predicted digit and a probability for each digit.

```
Browser (Next.js)  ──784 pixels──▶  Spring Boot  ──▶  ONNX model
                   ◀──digit + probabilities──
```

## Tech stack

| Part     | Technologies                          |
| -------- | ------------------------------------- |
| Frontend | Next.js, React, TypeScript, Tailwind  |
| Backend  | Java 21, Spring Boot, ONNX Runtime    |
| Model    | Python, PyTorch, ONNX                 |

## Run it locally

You need **Java 21** and **Node.js 20.9+**. The trained model is already included, so you don't need Python.

**Backend:**
```bash
cd backend
./mvnw spring-boot:run        # Windows: .\mvnw.cmd spring-boot:run
```

**Frontend** (in a second terminal):
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` and start drawing.

## Retraining the model

The training code is in `model/`:

```bash
cd model
pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cu126
pip install onnx onnxscript onnxruntime

python main.py          # train and save MNIST_net.pt
python test.py          # check the accuracy
python export_onnx.py   # convert to model.onnx
python verify_onnx.py   # check that ONNX gives the same results as PyTorch
```

Then copy `model.onnx` to `backend/src/main/resources/model/` and restart the backend.

## Limitations

The model only knows MNIST-style handwriting. Similar shapes like 4 and 9 or 1 and 7 can get mixed up, and a high percentage means the model is confident, not that it's always right.

## License

[MIT](LICENSE) © 2026 Matteo Alejandro Lozano Naranjo
