"use client";

import { useState } from "react";
import DrawingCanvas from "@/components/DrawingCanvas";
import PredictionChart from "@/components/PredictionChart";
import { predictDigit, PredictionResponse } from "@/lib/api";

export default function Home() {
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePredict(pixels: number[]) {
    setError(null);
    try {
      const response = await predictDigit(pixels);
      setResult(response);
    } catch {
      setError("Prediction failed. Is the backend running?");
    }
  }

  function handleClear() {
    setResult(null);
    setError(null);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">Digit Recognizer</h1>

      <div className="flex flex-col md:flex-row gap-12 items-center">
        <DrawingCanvas onPredict={handlePredict} onClear={handleClear} />
        <PredictionChart
          digit={result?.digit ?? null}
          probabilities={result?.probabilities ?? null}
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}
    </main>
  );
}