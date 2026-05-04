const GRIDLINE_COLOR   = "#808080";
const AXIS_COLOR       = "#5f5f5f";
const AXIS_LABEL_COLOR = "#333333";

export const AxisBottom = ({ xScale, pixelsPerTick, innerHeight, label, formatTick = d => d, showGridlines = true, showAxisLine = true }) => {
  const range = xScale.range();
  const width = range[1] - range[0];
  const ticks = xScale.ticks(Math.floor(width / pixelsPerTick));

  return (
    <g>
      {/* X gridlines — skip the last one */}
      {showGridlines && ticks.map(tick => (
        <line
          key={tick}
          x1={xScale(tick)} x2={xScale(tick)}
          y1={0} y2={innerHeight}
          stroke={GRIDLINE_COLOR} strokeWidth={0.5} opacity={0.4}
        />
      ))}

      {/* X tick labels */}
      {ticks.map(tick => (
        <text
          key={tick}
          x={xScale(tick)}
          y={innerHeight + 18}
          textAnchor="middle"
          fontSize={11}
          fill={AXIS_COLOR}
        >
          {formatTick(tick)}
        </text>
      ))}

      {/* X axis line */}
      {showAxisLine && (
        <line
          x1={0} x2={range[1]}
          y1={innerHeight} y2={innerHeight}
          stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4}
        />
      )}

      {/* X axis label */}
      <text
        x={width / 2}
        y={innerHeight + 42}
        textAnchor="middle"
        fontSize={13}
        fill={AXIS_LABEL_COLOR}
        fontWeight="bold"
      >
        {label}
      </text>
    </g>
  );
};

