import { useRef, useState } from 'react';
import { scaleLinear, scaleBand, max } from 'd3';
import { AxisBottom } from './AxisBottom';
import { useDimensions } from './use-dimensions';

const MARGIN = { top: 10, right: 50, bottom: 50, left: 90 };
const BAR_COLOR = '#591c00';
const BAR_HIGHLIGHT_COLOR = '#f0b105';
const AXIS_COLOR = '#5f5f5f';

const AxisBottomWithKFormat = ({ xScale, pixelsPerTick, innerHeight, label, showAxisLine }) => {
  const formatTick = (tick) => tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : `${tick}`;
  return <AxisBottom xScale={xScale} pixelsPerTick={pixelsPerTick} innerHeight={innerHeight} label={label} formatTick={formatTick} showAxisLine={showAxisLine} />;
};

export const P4_CountryBarChart = ({ data, SVG_WIDTH, SVG_HEIGHT, pixelsPerTickX = 50 }) => {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  if (SVG_WIDTH === 0 || SVG_HEIGHT === 0 || !data || data.length === 0) {
    return null;
  }

  const innerWidth = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

  const maxValue = max(data, d => d.primary_energy) || 1;
  const xScale = scaleLinear()
    .domain([0, maxValue])
    .range([0, innerWidth])
    .nice();

  const yScale = scaleBand()
    .domain(data.map(d => d.country))
    .range([0, innerHeight])
    .paddingInner(0.25);

  const barHeight = yScale.bandwidth();
  const year = data.length > 0 ? data[0].year : 'N/A';

  return (
    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

        <AxisBottomWithKFormat xScale={xScale} pixelsPerTick={pixelsPerTickX} innerHeight={innerHeight} label={`TWh`} showAxisLine={false} />

        {/* Country labels */}
        {data.map((d, i) => (
          <text
            key={d.country}
            x={-8}
            y={yScale(d.country) + barHeight / 2}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={11}
            fill={AXIS_COLOR}
          >
            {d.country}
          </text>
        ))}

        {/* Bars */}
        {data.map((d, i) => (
          <rect
            key={d.country}
            x={0}
            y={yScale(d.country)}
            width={xScale(d.primary_energy)}
            height={barHeight}
            rx={4}
            fill={hoveredCountry === d.country ? BAR_HIGHLIGHT_COLOR : BAR_COLOR}
            onMouseEnter={() => setHoveredCountry(d.country)}
            onMouseLeave={() => setHoveredCountry(null)}
            style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
          />
        ))}

        {/* Max label — only when it falls on the natural tick interval */}
        {(() => {
          const niceMax = xScale.domain()[1];
          const ticks = xScale.ticks(Math.floor(innerWidth / pixelsPerTickX));
          const interval = ticks.length > 1 ? ticks[1] - ticks[0] : niceMax;
          const lastTick = ticks[ticks.length - 1];
          if (niceMax !== lastTick + interval) return null;
          return (
            <text x={innerWidth} y={innerHeight + 18} textAnchor="middle" fontSize={11} fill={AXIS_COLOR}>
              {`${(niceMax / 1000).toFixed(0)}k`}
            </text>
          );
        })()}

        {/* Left axis line + right gridline */}
        <line x1={0} x2={0} y1={0} y2={innerHeight} stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4} />

      </g>
    </svg>
  );
};

export const P4_ResponsiveCountryBarChart = ({ height = 400, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: "100%", height }}>
      <P4_CountryBarChart SVG_WIDTH={chartSize.width} SVG_HEIGHT={chartSize.height} {...props} />
    </div>
  );
};
