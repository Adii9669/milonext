const radius = 126;
const center = 150;
const spacing = 11;

const points = Array.from({ length: Math.floor((radius * 2) / spacing) + 1 }, (_, row) => {
  const y = -radius + row * spacing;
  const rowOffset = row % 2 ? spacing / 2 : 0;
  const halfWidth = Math.sqrt(Math.max(0, radius * radius - y * y));
  const columns = Math.floor((halfWidth * 2) / spacing) + 1;

  return Array.from({ length: columns }, (_, column) => {
    const x = -halfWidth + column * spacing + rowOffset;
    const depth = Math.sqrt(Math.max(0, 1 - (x * x + y * y) / (radius * radius)));
    return {
      x: center + x,
      y: center + y,
      r: 1.2 + depth * 0.55,
      opacity: 0.28 + depth * 0.68,
    };
  });
}).flat();

export function OrbitSphere() {
  return (
    <svg className="orbit-sphere-dots" viewBox="0 0 300 300" aria-hidden="true">
      <defs>
        <mask id="orbit-sphere-mask">
          <circle cx="150" cy="150" r="127" fill="white" />
        </mask>
      </defs>
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={point.r} fill="var(--text-primary)" opacity={point.opacity} mask="url(#orbit-sphere-mask)" />
      ))}
    </svg>
  );
}
