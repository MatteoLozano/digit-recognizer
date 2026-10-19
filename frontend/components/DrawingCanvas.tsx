"use client";

import { useEffect, useRef } from "react";

const SIZE = 280; // 10 × 28, so it scales down cleanly to 28×28 later

type Props = {
  onPredict: (pixels: number[]) => void;
  onClear: () => void;
};

export default function DrawingCanvas({ onPredict, onClear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // Runs once after the canvas appears in the browser
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // Converts the mouse/finger position to canvas coordinates
  function getPosition(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (SIZE / rect.width),
      y: (e.clientY - rect.top) * (SIZE / rect.height),
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    isDrawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y); // draws a dot even if you only click
    ctx.stroke();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPosition(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    isDrawing.current = false;
  }

   function handleClear() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, SIZE, SIZE);
    onClear();
  }

    // Shrinks the drawing to 28×28 and returns 784 values between 0 and 1
  function getPixels(): number[] | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const small = document.createElement("canvas");
    small.width = 28;
    small.height = 28;
    const smallCtx = small.getContext("2d");
    if (!smallCtx) return null;

    smallCtx.drawImage(canvas, 0, 0, 28, 28);
    const data = smallCtx.getImageData(0, 0, 28, 28).data;

    const pixels: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      pixels.push(data[i] / 255); // red channel, 0–255 → 0–1
    }
    return pixels;
  }

  function handlePredict() {
    const pixels = getPixels();
    if (pixels) onPredict(pixels);
  }

return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="rounded-lg border border-zinc-300 touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className="flex gap-3">
        <button
          onClick={handlePredict}
          className="rounded-full bg-blue-600 text-white px-6 py-2 hover:bg-blue-700"
        >
          Predict
        </button>
        <button
          onClick={handleClear}
          className="rounded-full border border-zinc-300 px-6 py-2 hover:bg-zinc-100"
        >
          Clear
        </button>
      </div>
    </div>
  );
}


