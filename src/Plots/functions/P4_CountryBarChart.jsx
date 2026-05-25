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

const tooltipStyles = `
  .country-bar-tooltip {
    position: absolute;
    background: #ccc;
    padding: 10px 12px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
    text-align: left;
  }
  .country-bar-tooltip-row {
    padding: 2px 0;
  }
  .country-bar-tooltip-row:first-child {
    font-weight: bold;
    font-size: 12px;
  }
  .country-bar-tooltip-row:nth-child(2) {
    font-size: 11px;
  }
  .country-bar-tooltip-row:nth-child(n+3) {
    font-size: 10px;
  }
`;

export const P4_CountryBarChart = ({ data, SVG_WIDTH, SVG_HEIGHT, pixelsPerTickX = 50 }) => {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const chartRef = useRef(null);

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

  const handleMouseEnter = (d) => {
    setHoveredCountry(d.country);

    const fossil = (d.coal + d.oil + d.gas) || 0;
    const renewables = (d.hydro + d.solar + d.wind + d.biofuel + d.other_renewable) || 0;
    const total = d.primary_energy || 1;

    const barWidth = xScale(d.primary_energy);
    const tooltipWidthEstimate = 220;
    const isLongBar = MARGIN.left + barWidth + tooltipWidthEstimate > SVG_WIDTH;

    let xPos, yPos;
    if (isLongBar) {
      xPos = Math.max(MARGIN.left, MARGIN.left + barWidth - tooltipWidthEstimate + 100);
      yPos = MARGIN.top + yScale(d.country) + barHeight + 8;
    } else {
      xPos = MARGIN.left + barWidth + 10;
      yPos = MARGIN.top + yScale(d.country) - 50;
    }

    setTooltipData({
      country: d.country,
      year: d.year,
      total: d.primary_energy,
      fossilPct: (fossil / total * 100).toFixed(1),
      renewablePct: (renewables / total * 100).toFixed(1),
      nuclearPct: (d.nuclear / total * 100).toFixed(1),
      xPos,
      yPos
    });
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
    setTooltipData(null);
  };

  return (
    <>
      <style>{tooltipStyles}</style>
      <div ref={chartRef} style={{ position: 'relative', display: 'inline-block', width: SVG_WIDTH, height: SVG_HEIGHT }}>
        <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

            <AxisBottomWithKFormat xScale={xScale} pixelsPerTick={pixelsPerTickX} innerHeight={innerHeight} label={`TWh`} showAxisLine={false} />

            {/* Country labels */}
            {data.map((d) => (
              <text
                key={d.country}
                x={-8}
                y={yScale(d.country) + barHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fill={AXIS_COLOR}
                fontWeight={hoveredCountry === d.country ? 'bold' : 'normal'}
              >
                {d.country}
              </text>
            ))}

            {/* Bars */}
            {data.map((d, i) => {
              const barWidth = xScale(d.primary_energy);
              const labelX = Math.min(barWidth - 6, barWidth);
              return (
                <g key={d.country}>
                  <rect
                    x={0}
                    y={yScale(d.country)}
                    width={barWidth}
                    height={barHeight}
                    rx={4}
                    fill={hoveredCountry === d.country ? BAR_HIGHLIGHT_COLOR : BAR_COLOR}
                    onMouseEnter={() => handleMouseEnter(d)}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                  />
                </g>
              );
            })}

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

            {/* Left axis line */}
            <line x1={0} x2={0} y1={0} y2={innerHeight} stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4} />

          </g>
        </svg>

        {/* HTML Tooltip */}
        {tooltipData && (
          <div className="country-bar-tooltip" style={{ left: `${tooltipData.xPos}px`, top: `${tooltipData.yPos}px` }}>
            <div className="country-bar-tooltip-row">{tooltipData.country}, {tooltipData.year}</div>
            <div className="country-bar-tooltip-row">Total: {tooltipData.total.toFixed(0)} TWh</div>
            <div className="country-bar-tooltip-row">{tooltipData.fossilPct}% Fossil</div>
            <div className="country-bar-tooltip-row">{tooltipData.renewablePct}% Renewables</div>
            <div className="country-bar-tooltip-row">{tooltipData.nuclearPct}% Nuclear</div>
          </div>
        )}
      </div>
    </>
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
