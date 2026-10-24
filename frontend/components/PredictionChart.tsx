type Props = {
  digit: number | null;
  probabilities: number[] | null;
};

export default function PredictionChart({ digit, probabilities }: Props) {
  const values = probabilities ?? Array(10).fill(0);
  const best = digit ?? -1;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Prediction
        </p>
        <p
          className={`h-20 text-8xl font-bold leading-none tabular-nums ${
            best >= 0 ? "text-accent" : "text-line"
          }`}
        >
          {best >= 0 ? best : "–"}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {values.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className={`w-4 text-right font-mono text-sm ${
                i === best ? "font-bold text-accent" : "text-muted"
              }`}
            >
              {i}
            </span>

            <div className="flex-1 h-5 rounded bg-line/60 overflow-hidden">
              <div
                className={`h-full rounded transition-all duration-150 ease-out ${
                  i === best ? "bg-accent" : "bg-ink/30"
                }`}
                style={{ width: `${p * 100}%` }}
              />
            </div>

            <span
              className={`w-14 text-right font-mono text-xs tabular-nums ${
                i === best ? "text-ink" : "text-muted"
              }`}
            >
              {(p * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}