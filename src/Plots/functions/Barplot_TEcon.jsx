import { scaleBand, scaleLinear, max } from 'd3';

const MARGIN = { top: 20, right: 60, bottom: 0, left: 20 };
const SVG_WIDTH = 700;
const SVG_HEIGHT = 400;

const innerWidth  = SVG_WIDTH  - MARGIN.left - MARGIN.right;
const innerHeight = SVG_HEIGHT - MARGIN.top  - MARGIN.bottom;

{/*Define colour scheme*/}
const BAR_COLOR = "#076fa2";
const GRIDLINE_COLOR = "#808080";
const AXIS_LABEL_COLOR = "#5f5f5f";


function Barplot_TEcon({ data }) {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  const yScale = scaleBand()
    .domain(sorted.map(d => d.name))
    .range([0, innerHeight])
    .padding(0.35);

  const xScale = scaleLinear()
    .domain([0, max(sorted, d => d.count)])
    .range([0, innerWidth])
    .nice();

  const xTicks = xScale.ticks(10);

  return (
    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

        {/* X axis gridlines + tick labels */}
        {/* Move the x-value label to the top of the plot */}
        {xTicks.map(tick => (
          <g key={tick} transform={`translate(${xScale(tick)}, 0)`}>
            <line y1={0} y2={innerHeight} stroke={GRIDLINE_COLOR} opacity={0.2}/>
            <text
              y={-10}
              textAnchor="middle"
              fontSize="var(--plot-tick-size)"
              fill={AXIS_LABEL_COLOR}
            >
              {tick}
            </text>
          </g>
        ))}


        {/* Bars + labels */}
        {sorted.map(d => (
          <g key={d.name}>

            {/* Bar */}
            <rect
              x={0}
              y={yScale(d.name)}
              width={xScale(d.count)}
              height={yScale.bandwidth()}
              fill={BAR_COLOR}
              rx="var(--plot-bar-radius)"
            />

            {/* Y axis name label */}
            {/* Use ternary operator to control the position of the text label - if d.count count > 7, position it at x={10}, otherwise position it after the bar */}
            <text
              x={d.count > 7 ? 10 : xScale(d.count) + 6}
              y={yScale(d.name) + yScale.bandwidth() / 2}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize={14}
              fill={d.count > 7 ? "white" : BAR_COLOR}
            >
              {d.name}
            </text>

            {/* Value label */}
            {/*
            <text
              x={xScale(d.count) + 6}
              y={yScale(d.name) + yScale.bandwidth() / 2}
              dominantBaseline="middle"
              fontSize="var(--plot-label-size)"
              fill="var(--plot-label-color)"
            >
              {d.count}
            </text>
             */}
          </g>
        ))}

        {/* Add a solid y-axis line at x={0} */}
        <line x1={0} x2={0} y1={0} y2={innerHeight} stroke="var(--plot-axis-color)" />

        {/* X axis baseline */}
        {/* Remove the solid x-axis line */}
        {/* <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke="var(--plot-axis-color)" /> */}
      </g>
    </svg>
  );
}
export default Barplot_TEcon;
