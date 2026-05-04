import { useRef, useMemo } from 'react';
import { pie, arc } from 'd3';
import { useDimensions } from './use-dimensions';

const MARGIN = { top: 10, left: 20, right: 20, bottom: 10 };
const SOURCES = ['coal', 'oil', 'gas', 'nuclear', 'hydro', 'solar', 'wind', 'biofuel', 'other_renewable'];

const SOURCE_COLORS = {
  coal: '#3d3d3d',
  oil: '#62422a',
  gas: '#a48365',
  nuclear: '#a780cb',
  hydro: '#339bc4',
  solar: '#f0b105',
  wind: '#559651',
  biofuel: '#98df8a',
  other_renewable: '#21673b',
};

const AXIS_COLOR = '#5f5f5f';

export const P4_DonutChart = ({ data, SVG_WIDTH, SVG_HEIGHT, selectedYear }) => {
  if (SVG_WIDTH === 0 || SVG_HEIGHT === 0 || !data || data.length === 0) {
    return null;
  }

  const yearRow = data.find(d => d.year === selectedYear) || data[data.length - 1];

  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;
  const outerRadius = Math.min(SVG_WIDTH - MARGIN.left - MARGIN.right, SVG_HEIGHT - MARGIN.top - MARGIN.bottom) / 2 * 0.85;
  const innerRadius = outerRadius * 0.55;

  const pieData = useMemo(() => {
    return SOURCES.map(source => ({
      source,
      value: yearRow[source] || 0,
    }));
  }, [yearRow]);

  const pieGenerator = useMemo(() => {
    return pie().value(d => d.value);
  }, []);

  const arcGenerator = useMemo(() => {
    return arc().innerRadius(innerRadius).outerRadius(outerRadius);
  }, [innerRadius, outerRadius]);

  const arcs = useMemo(() => {
    return pieGenerator(pieData);
  }, [pieGenerator, pieData]);

  const total = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
        <g transform={`translate(${centerX}, ${centerY})`}>

          {/* Donut slices */}
          {arcs.map((arcData, i) => (
            <path
              key={pieData[i].source}
              d={arcGenerator(arcData)}
              fill={SOURCE_COLORS[pieData[i].source]}
              fillOpacity={0.85}
            />
          ))}

          {/* Center text */}
          <text
            x={0}
            y={-8}
            textAnchor="middle"
            fontSize={14}
            fontWeight="bold"
            fill={AXIS_COLOR}
          >
            World {selectedYear}
          </text>
          <text
            x={0}
            y={12}
            textAnchor="middle"
            fontSize={12}
            fill={AXIS_COLOR}
          >
            {total.toLocaleString('en-US', { maximumFractionDigits: 0 })} TWh
          </text>

        </g>

      {/*
        {/* Legend 
        <g transform={`translate(${SVG_WIDTH - 150}, ${MARGIN.top})`}>
          {[...SOURCES].reverse().map((source, i) => (
            <g key={source} transform={`translate(0, ${i * 18})`}>
              <rect width={12} height={12} fill={SOURCE_COLORS[source]} fillOpacity={0.7} />
              <text x={18} y={10} fontSize={11} fill={AXIS_COLOR}>
                {source.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
              </text>
            </g>
          ))}
        </g>
      */}

      </svg>
  );
};

export const P4_ResponsiveDonutChart = ({ height = 400, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: "100%", height }}>
      <P4_DonutChart SVG_WIDTH={chartSize.width} SVG_HEIGHT={chartSize.height} {...props} />
    </div>
  );
};
