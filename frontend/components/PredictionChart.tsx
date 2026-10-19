type Props = {
  digit: number | null;
  probabilities: number[] | null;
};

export default function PredictionChart({ digit, probabilities }: Props) {
  const values = probabilities ?? Array(10).fill(0);
  const best = digit ?? -1;

  return (
    <div className="w-72 flex flex-col gap-4">
      <div className="text-center">
        <p className="text-sm text-zinc-500">Prediction</p>
        <p className="text-6xl font-bold h-16">{best >= 0 ? best : "–"}</p>
      </div>

      <div className="flex flex-col gap-2">
        {values.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className={`w-4 text-right font-mono ${
                i === best ? "font-bold" : "text-zinc-500"
              }`}
            >
              {i}
            </span>

            <div className="flex-1 h-5 rounded bg-zinc-100 overflow-hidden">
              <div
                className={`h-full rounded transition-all duration-500 ease-out ${
                  i === best ? "bg-blue-600" : "bg-zinc-400"
                }`}
                style={{ width: `${p * 100}%` }}
              />
            </div>

            <span className="w-14 text-right text-sm tabular-nums">
              {(p * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}