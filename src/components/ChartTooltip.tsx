/** Readable dark tooltip for Recharts — white numbers on near-black panel */
export default function ChartTooltip({
  active,
  payload,
  label,
  valueSuffix = '',
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
  valueSuffix?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: '#18181b',
        border: '1px solid #3f3f46',
        borderRadius: 10,
        padding: '10px 12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        minWidth: 96,
      }}
    >
      {label != null && label !== '' && (
        <div style={{ color: '#a1a1aa', fontSize: 11, marginBottom: 6 }}>{label}</div>
      )}
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#fafafa',
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          {entry.color && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: entry.color,
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ color: '#d4d4d8', fontWeight: 500 }}>
            {entry.name ?? 'Value'}
          </span>
          <span style={{ marginLeft: 'auto', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
            {entry.value}
            {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
}
