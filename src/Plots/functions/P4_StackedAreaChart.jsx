import { useRef, useMemo } from 'react';
import { scaleLinear, stack, area, line, max } from 'd3';
import { AxisBottom } from './AxisBottom';
import { AxisLeft } from './AxisLeft';
import { useDimensions } from "./use-dimensions";

const MARGIN = { top: 30, right: 30, bottom: 50, left: 60 };
const SOURCES = ['coal', 'oil', 'gas', 'nuclear', 'hydro', 'solar', 'wind', 'biofuel', 'other_renewable'];

const SOURCE_COLORS = {
  coal: '#3d3d3d',
  oil: '#62422a',
  gas: '#a48365',
  nuclear: '#a780cb',
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

export const P4_StackedAreaChart = ({ data, SVG_WIDTH, SVG_HEIGHT, pixelsPerTickX = 50, pixelsPerTickY = 50 }) => {
  if (SVG_WIDTH === 0 || SVG_HEIGHT === 0) {
    return null;
  }

  const innerWidth = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

  const xScale = scaleLinear()
    .domain([data[0].year, data[data.length - 1].year])
    .range([0, innerWidth]);

  const maxEnergy = max(data, d => {
    return SOURCES.reduce((sum, source) => sum + d[source], 0);
  });

  const yScale = scaleLinear()
    .domain([0, maxEnergy])
    .range([innerHeight, 0])
    .nice();

  const stackedData = useMemo(() => {
    return stack().keys(SOURCES)(data);
  }, [data]);

  const areaGenerator = useMemo(() => {
    return area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]));
  }, [xScale, yScale]);

  const topLineGenerator = useMemo(() => {
    return line()
      .x(d => xScale(d.data.year))
      .y(d => yScale(d[1]));
  }, [xScale, yScale]);

  return (
    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

        <AxisBottom xScale={xScale} pixelsPerTick={pixelsPerTickX} innerHeight={innerHeight} label="" showGridlines={false} />
        <AxisLeftWithKFormat yScale={yScale} pixelsPerTick={pixelsPerTickY} innerWidth={innerWidth} label="" showGridlines={true} />

        {/* Stacked areas */}
        {stackedData.map((layer, i) => (
          <path
            key={SOURCES[i]}
            d={areaGenerator(layer)}
            fill={SOURCE_COLORS[SOURCES[i]]}
            fillOpacity={0.8}
            stroke="none"
          />
        ))}

        {/* Top border lines for each area */}
        {stackedData.map((layer, i) => (
          <path
            key={`border-${SOURCES[i]}`}
            d={topLineGenerator(layer)}
            fill="none"
            stroke="#2c2c2c"
            strokeWidth={0.2}
          />
        ))}

        {/* Legend */}
        {[...SOURCES].reverse().map((source, i) => (
          <g key={source} transform={`translate(${10}, ${20 + i * 18})`}>
            <rect width={12} height={12} fill={SOURCE_COLORS[source]} fillOpacity={0.7} />
            <text x={18} y={10} fontSize={11} fill={AXIS_COLOR}>
              {source.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
            </text>
          </g>
        ))}

        {/* Axis lines */}
        <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4} />
        <line x1={0} x2={0} y1={0} y2={innerHeight} stroke={AXIS_COLOR} strokeWidth={1} opacity={0.4} />

      </g>
    </svg>
  );
};

export const P4_ResponsiveStackedAreaChart = ({ height = 400, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: "100%", height }}>
      <P4_StackedAreaChart SVG_WIDTH={chartSize.width} SVG_HEIGHT={chartSize.height} {...props} />
    </div>
  );
};
