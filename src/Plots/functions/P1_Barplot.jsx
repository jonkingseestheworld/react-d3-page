import { scaleBand, scaleLinear, max } from 'd3';

const MARGIN = { top: 20, right: 50, bottom: 30, left: 100 };
const SVG_WIDTH = 650;
const SVG_HEIGHT = 400;

const innerWidth  = SVG_WIDTH  - MARGIN.left - MARGIN.right;
const innerHeight = SVG_HEIGHT - MARGIN.top  - MARGIN.bottom;

function P1_Barplot({ data }) {
  const yScale = scaleBand()
    .domain(data.map(d => d.country))
    .range([0, innerHeight])
    .padding(0.25);

  const xScale = scaleLinear()
    .domain([0, max(data, d => d.students)])
    .range([0, innerWidth])
    .nice();

  const xTicks = xScale.ticks(5);

  return (
    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

        {/* Gridlines + X axis tick labels */}
        {xTicks.map(tick => (
          <g key={tick} transform={`translate(${xScale(tick)}, 0)`}>
            <line y1={0} y2={innerHeight} stroke="var(--plot-gridline-color)" strokeDasharray="4 2" />
            <text y={innerHeight + 16} textAnchor="middle" fontSize="var(--plot-tick-size)" fill="var(--plot-axis-label-color)">
              {tick}
            </text>
          </g>
        ))}

        {/* Bars + labels */}
        {data.map(d => (
          <g key={d.country}>
            {/* Country label (Y axis) */}
            <text
              x={-8}
              y={yScale(d.country) + yScale.bandwidth() / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="var(--plot-label-size)"
              fill="var(--plot-axis-label-color)"
            >
              {d.flag}
            </text>

            {/* Bar */}
            <rect
              x={0}
              y={yScale(d.country)}
              width={xScale(d.students)}
              height={yScale.bandwidth()}
              style={{ fill: 'var(--plot-bar-color)', rx: 'var(--plot-bar-radius)' }}
            />

            {/* Value label */}
            <text
              x={xScale(d.students) + 6}
              y={yScale(d.country) + yScale.bandwidth() / 2}
              dominantBaseline="middle"
              fontSize="var(--plot-label-size)"
              fill="var(--plot-label-color)"
            >
              {d.students}
            </text>
          </g>
        ))}

        {/* X axis baseline */}
        <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke="var(--plot-axis-color)" />
      </g>
    </svg>
  );
}

export default P1_Barplot;