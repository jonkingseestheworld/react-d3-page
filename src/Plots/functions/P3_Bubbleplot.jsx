import { useState, useRef, useMemo } from 'react';
import { scaleLinear, scaleSqrt, max } from 'd3';
import { AxisBottom } from './AxisBottom';
import { AxisLeft } from './AxisLeft';
import { useDimensions } from "./use-dimensions";


const MARGIN = { top: 30, right: 30, bottom: 50, left: 60 };


const AXIS_COLOR = "#5f5f5f";

const CONTINENT_COLORS = {
  Africa:   "#e15759",
  Americas: "#f28e2b",
  Asia:     "#4e79a7",
  Europe:   "#59a14f",
  Oceania:  "#b07aa1",
};

export const AxisBottomWithKFormat = ({ xScale, pixelsPerTick, innerHeight, label }) => {
  const formatTick = (tick) => tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : `${tick}`;
  return <AxisBottom xScale={xScale} pixelsPerTick={pixelsPerTick} innerHeight={innerHeight} label={label} formatTick={formatTick} />;
};


export const P3_Bubbleplot = ({ data, pixelsPerTickX=80, pixelsPerTickY=50, SVG_WIDTH, SVG_HEIGHT}) => {
  
  if (SVG_WIDTH === 0 || SVG_HEIGHT === 0) {
    return null;
  }

  const innerWidth  = SVG_WIDTH  - MARGIN.left - MARGIN.right;
  const innerHeight = SVG_HEIGHT - MARGIN.top  - MARGIN.bottom;

  const [activeContinent, setActiveContinent] = useState(null);
  const [tooltip, setTooltip] = useState(null); // { d, x, y }

  const xScale = scaleLinear()
    .domain([-5, max(data, d => d.gdpPercap)])
    .range([0, innerWidth])
    .nice();

  const yScale = scaleLinear()
    .domain([30, max(data, d => d.lifeExp)])
    .range([innerHeight, 0])
    .nice();

  const rScale = scaleSqrt()
    .domain([0, max(data, d => d.pop)])
    .range([2, 40]);

  const sizeLevels = [
    { pop: 1_000_000,     label: '1M'   },
    { pop: 10_000_000,     label: '10M'  },
    { pop: 100_000_000,    label: '100M' },
    { pop: 1_000_000_000,  label: '1B'   },
  ];

  const bubbleLegendPositions = useMemo(() => {
    let curX = 0;
    return sizeLevels.map(({ pop, label }) => {
      const r = rScale(pop);
      const cx = curX + r;
      curX = cx + r + 10;
      return { r, cx, label };
    });
  }, [rScale]);

  return (
    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

        <AxisBottomWithKFormat xScale={xScale} pixelsPerTick={pixelsPerTickX} innerHeight={innerHeight} label="GDP per capita (USD)" />
        <AxisLeft   yScale={yScale} pixelsPerTick={pixelsPerTickY} innerWidth={innerWidth}   label="Life Expectancy (years)" />

        {/* Bubbles — render smaller pops on top */}
        {[...data]
          .sort((a, b) => b.pop - a.pop)
          .map(d => {
            const isActive = !activeContinent || d.continent === activeContinent;
            return (
              <circle
                key={d.country}
                cx={xScale(d.gdpPercap)}
                cy={yScale(d.lifeExp)}
                r={rScale(d.pop)}
                fill={CONTINENT_COLORS[d.continent] ?? "#999"}
                fillOpacity={isActive ? 0.45 : 0.05}
                stroke={CONTINENT_COLORS[d.continent] ?? "#999"}
                strokeWidth={0.5}
                strokeOpacity={isActive ? 0.9 : 0.1}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ d, x: xScale(d.gdpPercap), y: yScale(d.lifeExp) })}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

        {/* Axes */}
        {/* Change the axes to lighter colour or adjust the opacity */}
        <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4} />
        <line x1={0} x2={0} y1={0} y2={innerHeight} stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4} />

        {/* Continent colour legend */}
        {Object.entries(CONTINENT_COLORS).map(([continent, color], i) => {
          const isSelected = activeContinent === continent;
          return (
            <g
              key={continent}
              transform={`translate(${innerWidth - 100}, ${180 + i * 20})`}
              onClick={() => setActiveContinent(isSelected ? null : continent)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={6} cy={0} r={6} fill={color} fillOpacity={isSelected ? 1 : 0.5} />
              <text
                x={16} y={0}
                dominantBaseline="middle"
                fontSize={11}
                fill={AXIS_COLOR}
                fontWeight={isSelected ? 'bold' : 'normal'}
              >
                {continent}
              </text>
            </g>
          );
        })}

        {/* Population size bubble legend — bottom right */}
        {(() => {
          const legendX   = innerWidth - 145;
          const legendY   = innerHeight - 5;
          const BUBBLE_FILL   = "#c9d8e3";
          const BUBBLE_STROKE = "#7a9cad";
          const curX = bubbleLegendPositions[bubbleLegendPositions.length - 1].cx + bubbleLegendPositions[bubbleLegendPositions.length - 1].r + 10;

          return (
            <g transform={`translate(${legendX}, ${legendY})`}>
              {/* Title */}
              <text
                x={curX/6 - 5}
                y={-rScale(1_000_000_000) - 30}
                textAnchor="middle"
                fontSize={10}
                fill={AXIS_COLOR}
                letterSpacing="0.5"
              >
                SIZE BY POPULATION
              </text>

              {bubbleLegendPositions.map(({ r, cx, label }) => (
                <g key={label}>
                  <circle
                    cx={cx}
                    cy={-r}
                    r={r}
                    fill={BUBBLE_FILL}
                    fillOpacity={0.4}
                    stroke={BUBBLE_STROKE}
                    strokeWidth={0.8}
                  />
                  <text
                    x={cx}
                    y={-2*r -4 }
                    textAnchor="middle"
                    fontSize={10}
                    fill={AXIS_COLOR}
                  >
                    {label}
                  </text>
                </g>
              ))}
            </g>
          );
        })()}

        {/* Tooltip */}
        {tooltip && (() => {
          const { d, x, y } = tooltip;
          const lines = [
            d.country,
            `Life exp: ${d.lifeExp.toFixed(1)} yrs`,
            `Population: ${d.pop.toLocaleString()}`,
            `GDP/capita: $${d.gdpPercap.toFixed(1)}`,
          ];
          const boxW = 160;
          const boxH = 16 + lines.length * 16;
          const pad  = 10;
          // flip left if too close to right edge, flip up if too close to bottom
          const bx = x + pad + boxW > innerWidth  ? x - pad - boxW : x + pad;
          const by = y + pad + boxH > innerHeight  ? y - pad - boxH : y + pad;
          return (
            <g transform={`translate(${bx}, ${by})`} style={{ pointerEvents: 'none' }}>
              <rect
                width={boxW} height={boxH}
                rx={5} ry={5}
                fill="#c9d8e3" fillOpacity={0.95}
                stroke="#c9d8e3" strokeWidth={1}
              />
              {lines.map((line, i) => (
                <text
                  key={i}
                  x={10}
                  y={16 + i * 16}
                  fontSize={i === 0 ? 12 : 11}
                  fontWeight={i === 0 ? 'bold' : 'normal'}
                  fill="#333"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })()}

      </g>
    </svg>
  )
} ;

export const P3_ResponsiveBubbleplot = ({ height = 450, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: "100%", height }}>
      <P3_Bubbleplot SVG_WIDTH={chartSize.width} SVG_HEIGHT={chartSize.height} {...props} />
    </div>
  );
};