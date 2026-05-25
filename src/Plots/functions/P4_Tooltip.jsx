export const P4_Tooltip = ({ year, data, sources, colors, show = true }) => {
  if (!show || !year || !data) return null;

  const yearData = data.find(d => d.year === year);
  if (!yearData) return null;

  return (
    <div
      style={{
        backgroundColor: '#ccc',
        border: '1px solid #ccc',
        borderRadius: '6px',
        padding: '12px 16px',
        boxShadow: '0 4px 8px #ccc',
        minWidth: '200px',
        fontSize: '12px',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
        {year}
      </div>
      {sources.map((source) => (
        <div
          key={source}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '4px',
          }}
        >
          <span style={{ color: colors[source] || '#333' }}>
            {source.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
            :
          </span>
          <span style={{ fontWeight: '500' }}>
            {(yearData[source] || 0).toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      ))}
    </div>
  );
};
