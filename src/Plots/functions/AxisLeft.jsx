const GRIDLINE_COLOR   = "#808080";
const AXIS_COLOR       = "#5f5f5f";
const AXIS_LABEL_COLOR = "#333333";

export const AxisLeft = ({ yScale, pixelsPerTick, innerWidth, label }) => {
  const range = yScale.range();
  const height = range[0] - range[1];
  const ticks = yScale.ticks(Math.floor(height / pixelsPerTick));

  return (
    <>
      {ticks.map((tick) => (
        <g>
          {/* Y gridlines */}
          <line
            key={tick}
            x1={0} x2={innerWidth}
            y1={yScale(tick)} y2={yScale(tick)}
            stroke={GRIDLINE_COLOR} strokeWidth={0.5} opacity={0.4}
          />
          {/* Y tick labels */}
          <text
            key={tick}
            x={-8}
            y={yScale(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={11}
            fill={AXIS_COLOR}
          >
            {tick}
          </text>
        </g>
      ))}

      {/* Y axis line */}
      <line
        x1={0} x2={0}
        y1={0} y2={range[1]}
        stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4}
      />

      {/* Y axis label */}
      {label && (
        <text
          transform={`translate(-45, ${height / 2}) rotate(-90)`}
          textAnchor="middle"
          fontSize={13}
          fill={AXIS_LABEL_COLOR}
          fontWeight="bold"
       >
        {label}
       </text>
      )}
    </>
  );
};
