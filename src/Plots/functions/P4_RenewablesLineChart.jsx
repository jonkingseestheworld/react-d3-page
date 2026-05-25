import { useRef, useMemo, useState } from 'react';
import { scaleLinear, line, max, bisect } from 'd3';
import { AxisBottom } from './AxisBottom';
import { AxisLeft } from './AxisLeft';
import { useDimensions } from "./use-dimensions";

const MARGIN = { top: 30, right: 75, bottom: 50, left: 60 };
const RENEWABLE_SOURCES = ['hydro', 'solar', 'wind', 'biofuel', 'other_renewable'];

const SOURCE_LABELS = {
  hydro: 'Hydro',
  solar: 'Solar',
  wind: 'Wind',
  biofuel: 'Biofuel',
  other_renewable: 'Others',
};

const SOURCE_COLORS = {
  hydro: '#339bc4',
  solar: '#f0b105',
  wind: '#559651',
  biofuel: '#89cb7b',
  other_renewable: '#21673b',
};

const AXIS_COLOR = "#5f5f5f";

const formatValue = (v) => {
  return Math.round(v).toLocaleString('en-US');
};

export const AxisLeftWithKFormat = ({ yScale, pixelsPerTick, innerWidth, label, showGridlines = true }) => {
    const formatTick = (tick) => tick.toLocaleString();;
  return <AxisLeft yScale={yScale} pixelsPerTick={pixelsPerTick} innerWidth={innerWidth} label={label} formatTick={formatTick} showGridlines={showGridlines} />;
};


export const P4_RenewablesLineChart = ({ data, SVG_WIDTH, SVG_HEIGHT, pixelsPerTickX = 50, pixelsPerTickY = 50, hoveredYear, onHover, onTooltipPos }) => {
  const [tooltipPos, setTooltipPos] = useState(null);

  const updateTooltipPos = (pos) => {
    setTooltipPos(pos);
    onTooltipPos?.(pos);
  };

  const innerWidth = Math.max(0, SVG_WIDTH - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, SVG_HEIGHT - MARGIN.top - MARGIN.bottom);

  const xScale = scaleLinear()
    .domain([data[0].year, data[data.length - 1].year])
    .range([0, innerWidth]);

  const maxRenewable = max(data, d => {
    return max(RENEWABLE_SOURCES, source => d[source]);
  });

  const yScale = scaleLinear()
    .domain([0, maxRenewable])
    .range([innerHeight, 0])
    .nice();

  const lineGenerators = useMemo(() => {
    return RENEWABLE_SOURCES.reduce((acc, source) => {
      acc[source] = line()
        .x(d => xScale(d.year))
        .y(d => yScale(d[source]));
      return acc;
    }, {});
  }, [xScale, yScale]);

  if (SVG_WIDTH === 0 || SVG_HEIGHT === 0) {
    return null;
  }

  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - MARGIN.left;
    const year = xScale.invert(x);

    const yearIndex = bisect(data.map(d => d.year), year) - 1;
    if (yearIndex >= 0 && yearIndex < data.length) {
      const closestYear = data[yearIndex].year;
      onHover?.(closestYear);
      updateTooltipPos(x);
    }
  };

  const handleMouseLeave = () => {
    onHover?.(null);
    updateTooltipPos(null);
  };

  return (
    <svg width={SVG_WIDTH} height={SVG_HEIGHT} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ cursor: 'crosshair' }}>
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

        <AxisBottom xScale={xScale} pixelsPerTick={pixelsPerTickX} innerHeight={innerHeight} label="" showGridlines={false} />
        <AxisLeftWithKFormat yScale={yScale} pixelsPerTick={pixelsPerTickY} innerWidth={innerWidth} label="" showGridlines={true} />

        {/* Lines for each renewable source */}
        {RENEWABLE_SOURCES.map(source => (
          <path
            key={source}
            d={lineGenerators[source](data)}
            fill="none"
            stroke={SOURCE_COLORS[source]}
            strokeWidth={2}
          />
        ))}

        {/* End-of-line labels */}
        {RENEWABLE_SOURCES.map(source => {
          const lastPoint = data[data.length - 1];
          const hoveredData = hoveredYear ? data.find(d => d.year === hoveredYear) : null;
          return (
            <text
              key={source}
              x={innerWidth + 6}
              y={yScale(lastPoint[source])}
              dominantBaseline="middle"
              fontSize={11}
              fill={SOURCE_COLORS[source]}
              fontWeight="600"
            >
              {SOURCE_LABELS[source]}
              {hoveredData && (
                <tspan x={innerWidth + 6} dy="1.3em" fontSize={10} fontWeight="400">
                  {formatValue(hoveredData[source])}
                </tspan>
              )}
            </text>
          );
        })}

        {/* Axis lines */}
        <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4} />
        <line x1={0} x2={0} y1={0} y2={innerHeight} stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4} />

        {/* Hover line */}
        {hoveredYear !== null && (
          <line
            x1={xScale(hoveredYear)}
            x2={xScale(hoveredYear)}
            y1={0}
            y2={innerHeight}
            stroke="#666"
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.5}
            pointerEvents="none"
          />
        )}

      </g>

    </svg>
  );
};

export const P4_ResponsiveRenewablesLineChart = ({ height = 400, hoveredYear, onHover, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);
  const [tooltipPos, setTooltipPos] = useState(null);

  const handleHover = (year) => {
    onHover?.(year);
  };

  return (
    <div ref={chartRef} style={{ width: "100%", height, position: 'relative' }}>
      <P4_RenewablesLineChart
        SVG_WIDTH={chartSize.width}
        SVG_HEIGHT={chartSize.height}
        hoveredYear={hoveredYear}
        onHover={handleHover}
        onTooltipPos={setTooltipPos}
        {...props}
      />
      {hoveredYear && tooltipPos !== null && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: `${tooltipPos + MARGIN.left}px`,
          transform: 'translateX(-50%)',
          backgroundColor: '#ccc',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '12px',
          fontWeight: '500',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap'
        }}>
          {hoveredYear}
        </div>
      )}
    </div>
  );
};
