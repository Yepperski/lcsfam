const DiscordStatusIcon = ({ status, size = 16 }: { status?: string; size?: number }) => {
  const s = status || 'offline';
  const r = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {s === 'online' && (
        <circle cx={r} cy={r} r={r} fill="#3ba55c" />
      )}
      {s === 'idle' && (
        <>
          <circle cx={r} cy={r} r={r} fill="#faa61a" />
          <circle cx={r * 0.6} cy={r * 0.6} r={r * 0.55} fill="var(--status-bg, #1e1f22)" />
        </>
      )}
      {s === 'dnd' && (
        <>
          <circle cx={r} cy={r} r={r} fill="#ed4245" />
          <rect x={r * 0.5} y={r - size * 0.09} width={r} height={size * 0.18} rx={size * 0.06} fill="var(--status-bg, #1e1f22)" />
        </>
      )}
      {s === 'offline' && (
        <>
          <circle cx={r} cy={r} r={r} fill="#747f8d" />
          <circle cx={r} cy={r} r={r * 0.45} fill="var(--status-bg, #1e1f22)" />
        </>
      )}
    </svg>
  );
};

export default DiscordStatusIcon;
