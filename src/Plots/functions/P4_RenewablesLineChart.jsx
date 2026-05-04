import { useRef, useMemo } from 'react';
import { scaleLinear, line, max } from 'd3';
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

export const AxisLeftWithKFormat = ({ yScale, pixelsPerTick, innerWidth, label, showGridlines = true }) => {
    const formatTick = (tick) => tick.toLocaleString();;
  return <AxisLeft yScale={yScale} pixelsPerTick={pixelsPerTick} innerWidth={innerWidth} label={label} formatTick={formatTick} showGridlines={showGridlines} />;
};


export const P4_RenewablesLineChart = ({ data, SVG_WIDTH, SVG_HEIGHT, pixelsPerTickX = 50, pixelsPerTickY = 50 }) => {
  if (SVG_WIDTH === 0 || SVG_HEIGHT === 0) {
    return null;
  }

  const innerWidth = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

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

  return (
    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
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
            </text>
          );
        })}

        {/* Axis lines */}
        <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4} />
        <line x1={0} x2={0} y1={0} y2={innerHeight} stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4} />

      </g>
    </svg>
  );
};

export const P4_ResponsiveRenewablesLineChart = ({ height = 400, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: "100%", height }}>
      <P4_RenewablesLineChart SVG_WIDTH={chartSize.width} SVG_HEIGHT={chartSize.height} {...props} />
    </div>
  );
};
