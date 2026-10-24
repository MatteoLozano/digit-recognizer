"use client";

import { useRef, useState } from "react";
import DrawingCanvas from "@/components/DrawingCanvas";
import PredictionChart from "@/components/PredictionChart";
import { predictDigit, PredictionResponse } from "@/lib/api";

export default function Home() {
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0); // ignores responses that are no longer the latest
  const [infoTab, setInfoTab] = useState<"about" | "mistakes">("about");

  async function handlePredict(pixels: number[]) {
    const id = ++requestId.current;
    try {
      const response = await predictDigit(pixels);
      if (id !== requestId.current) return;
      setResult(response);
      setError(null);
    } catch {
      if (id !== requestId.current) return;
      setError("Prediction failed. Is the backend running?");
    }
  }

  function handleClear() {
    requestId.current++;
    setResult(null);
    setError(null);
  }

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-center gap-8 px-4 py-10 sm:px-8 sm:py-16">
      <header className="flex flex-col gap-3">

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Digit Recognizer
        </h1>
        <p className=" text-muted">
          Draw a single digit from 0 to 9. The prediction updates live as you
          draw.
        </p>
      </header>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Input
          </h2>
          <DrawingCanvas onPredict={handlePredict} onClear={handleClear} />
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Output
          </h2>
          <PredictionChart
            digit={result?.digit ?? null}
            probabilities={result?.probabilities ?? null}
          />
        </section>
      </div>

      {error && (
        <p className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          {error}
        </p>
      )}


    <div className="flex flex-col gap-3">
      <div role="tablist" className="flex gap-5 border-b border-line">
        {(
          [
            ["about", "About the model"],
            ["mistakes", "Where it goes wrong"],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            role="tab"
            aria-selected={infoTab === tab}
            onClick={() => setInfoTab(tab)}
            className={`-mb-px border-b pb-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              infoTab === tab
                ? "border-accent text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {infoTab === "about" ? (
      <div role="tabpanel" className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          The predictions come from a small convolutional neural network built
          with PyTorch. It has two convolution layers that pick out strokes
          and shapes, each followed by max pooling, and two fully connected
          layers that turn those features into a score for each digit from 0
          to 9.
        </p>
        <p className="text-sm text-muted">
          It was trained on the MNIST dataset, 60,000 handwritten digits
          scaled to 28×28 pixels, for 5 epochs with the Adam optimizer and
          cross-entropy loss. On the 10,000 MNIST test images it never saw
          during training, it gets 99% right.
        </p>
        <p className="text-sm text-muted">
          Your drawing is shrunk to the same 28×28 size and sent to a Spring
          Boot backend, which runs the network as an ONNX model and returns
          the probability for each digit.
        </p>
      </div>
      ) : (
      <div role="tabpanel" className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          The model only knows the kind of handwriting it was trained on. If
          your digit looks very different, it can guess wrong. For the best
          results, draw one large digit in the middle of the box.
        </p>
        <p className="text-sm text-muted">
          Digits with similar shapes are the easiest to mix up, like 4 and 9,
          3 and 8, or 1 and 7. Personal writing styles, such as a 7 with a
          line through it, can also confuse it.
        </p>
        <p className="text-sm text-muted">
          The percentages show how sure the model is, not whether it is
          right. It can be very sure and still be wrong, especially when the
          drawing doesn&apos;t look like any digit at all.
        </p>
      </div>
      )}
    </div>
     
    </main>
  );
}