export const RoundCelebration = () => (
  <div aria-hidden="true" className="round-celebration pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: 12 }, (_, index) => (
      <span key={index} className={`celebration-piece celebration-piece-${index % 3}`} />
    ))}
  </div>
);