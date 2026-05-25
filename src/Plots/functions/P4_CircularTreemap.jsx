import { useRef, useState, useEffect } from 'react';
import { voronoiMapSimulation } from 'd3-voronoi-map';
import { useDimensions } from './use-dimensions';
import { RoughNotation } from 'react-rough-notation';

const SOURCES = ['coal', 'oil', 'gas', 'nuclear', 'hydro', 'solar', 'wind', 'biofuel', 'other_renewable'];

const SOURCE_LABELS = {
  coal: 'Coal',
  oil: 'Oil',
  gas: 'Gas',
  nuclear: 'Nuclear',
  hydro: 'Hydro',
  solar: 'Solar',
  wind: 'Wind',
  biofuel: 'Biofuel',
  other_renewable: 'Others',
};

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
const YEAR_HIGHLIGHT_COLOR = "#FCAC89"; 

const getCentroid = (polygon) => {
  if (!polygon || polygon.length === 0) return [0, 0];
  let x = 0, y = 0;
  for (let p of polygon) {
    x += p[0];
    y += p[1];
  }
  return [x / polygon.length, y / polygon.length];
};

const getLabelPosition = (polygon) => {
  if (!polygon || polygon.length < 3) return getCentroid(polygon);
  let x = 0, y = 0;
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    const cross = p1[0] * p2[1] - p2[0] * p1[1];
    area += cross;
    x += (p1[0] + p2[0]) * cross;
    y += (p1[1] + p2[1]) * cross;
  }
  area /= 2;
  if (area === 0) return getCentroid(polygon);
  return [x / (6 * area), y / (6 * area)];
};

export const P4_CircularTreemap = ({ data, SVG_WIDTH, SVG_HEIGHT, selectedYear }) => {
  const [cells, setCells] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  // Always call hooks first
  const yearRow = data?.find(d => d.year === selectedYear) || data?.[data.length - 1];
  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;
  const radius = Math.min(SVG_WIDTH, SVG_HEIGHT) / 2 * 0.75;

  const total = yearRow ? SOURCES.reduce((sum, source) => sum + (yearRow[source] || 0), 0) : 0;

  // Build voronoi treemap
  useEffect(() => {
    if (SVG_WIDTH === 0 || SVG_HEIGHT === 0 || !yearRow) {
      setCells(null);
      return;
    }

    try {
      // Normalize weights to percentages for better voronoi algorithm behavior
      const voronoiData = SOURCES.map(source => {
        const value = yearRow[source] || 0;
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return {
          source: source,
          weight: value,
          normalizedWeight: percentage,
        };
      }).filter(d => d.weight > 0);

      // Create circular clip path
      const clipPath = [];
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        clipPath.push([
          radius * Math.cos(angle),
          radius * Math.sin(angle),
        ]);
      }

      // Seeded PRNG so the initial cell positions are always the same
      let seed = 42;
      const seededPrng = () => {
        seed = (seed * 1664525 + 1013904223) & 0xffffffff;
        return (seed >>> 0) / 0xffffffff;
      };

      // Create and run simulation using normalized percentage weights
      const simulation = voronoiMapSimulation(voronoiData)
        .weight(d => d.normalizedWeight)
        .clip(clipPath)
        .prng(seededPrng)
        .maxIterationCount(500);

      simulation.on('end', function() {
        const state = simulation.state();
        if (state && state.polygons && state.polygons.length > 0) {
          // Calculate polygon areas
          const polygonsWithArea = state.polygons.map((polygon, i) => {
            const area = Math.abs(
              polygon.reduce((sum, p, idx) => {
                const next = polygon[(idx + 1) % polygon.length];
                return sum + (p[0] * next[1] - next[0] * p[1]);
              }, 0) / 2
            );
            return { polygon, area, index: i };
          });

          // Sort both polygons and voronoi data by size/weight
          const sortedPolygons = [...polygonsWithArea].sort((a, b) => b.area - a.area);
          const sortedData = [...voronoiData].sort((a, b) => b.normalizedWeight - a.normalizedWeight);

          // Match by sorted order (largest polygon → largest weight, etc.)
          const renderCells = sortedPolygons.map((pw, sortedIndex) => ({
            source: sortedData[sortedIndex]?.source,
            weight: sortedData[sortedIndex]?.weight,
            polygon: pw.polygon,
          }));

          setCells(renderCells);
        }
      });

      simulation.tick(Infinity);
    } catch (err) {
      console.error('Voronoi error:', err);
      setCells(null);
    }
  }, [yearRow, radius]);

  if (SVG_WIDTH === 0 || SVG_HEIGHT === 0 || !data || data.length === 0) {
    return <div style={{ width: SVG_WIDTH, height: SVG_HEIGHT }} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'left', marginBottom: 0, paddingBottom:0, color: AXIS_COLOR }}>
      {/**  <div style={{ fontSize: 14, fontWeight: 'bold' }}>World {selectedYear}</div> **/}
        <div style={{ fontSize: 12, fontWeight: 'bold' }}>
          Global total: <RoughNotation key={`tot-${yearRow}`}  type="highlight" color={YEAR_HIGHLIGHT_COLOR} show={true} animationDuration={400}>{total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</RoughNotation>  TWh
        </div>
      </div> 

      {/* Change the marginTop for the actual plot SVG to 0 */}
      <svg width={SVG_WIDTH} height={SVG_HEIGHT} style={{ marginTop: 0, paddingTop: 0 }}>
        <g transform={`translate(${centerX}, ${centerY})`}>
          {/* Background circle */}
          <circle cx={0} cy={0} r={radius} fill="none" stroke="#999" strokeWidth={1} opacity={0.2} />

          {/* Voronoi cells */}
          {cells && cells.map((cell, idx) => {
            if (!cell.polygon || cell.polygon.length === 0) return null;
            const pathData = cell.polygon.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join('') + 'Z';
            const [labelX, labelY] = getLabelPosition(cell.polygon);
            const percentage = total > 0 ? (cell.weight / total * 100) : 0;
            const showLabel = percentage >= 3;

            return (
              <g key={`cell-${idx}`}>
                <path
                  d={pathData}
                  fill={SOURCE_COLORS[cell.source]}
                  fillOpacity={tooltip?.source === cell.source ? 1.0 : 0.8}
                  stroke="#fff"
                  strokeWidth={2}
                  onMouseEnter={() => {
                    const [cx, cy] = getLabelPosition(cell.polygon);
                    setTooltip({ source: cell.source, weight: cell.weight, x: cx, y: cy });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: 'pointer' }}
                />
                {showLabel && (
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    fontWeight="600"
                    fill="#fff"
                    pointerEvents="none"
                  >
                    {SOURCE_LABELS[cell.source]}
                  </text>
                )}
              </g>
            );
          })}

          {/* Tooltip */}
          {tooltip && (() => {
            const percentage = total > 0 ? (tooltip.weight / total * 100).toFixed(1) : 0;
            const lines = [
              SOURCE_LABELS[tooltip.source],
              `${percentage}%`,
              `${tooltip.weight.toLocaleString('en-US', { maximumFractionDigits: 2 })} TWh`,
            ];
            const boxW = 140;
            const boxH = 16 + lines.length * 16;
            const pad = 10;
            const bx = tooltip.x + pad + boxW > radius ? tooltip.x - pad - boxW : tooltip.x + pad;
            const by = tooltip.y + pad + boxH > radius ? tooltip.y - pad - boxH : tooltip.y + pad;
            return (
              <g transform={`translate(${bx}, ${by})`} style={{ pointerEvents: 'none' }}>
                <rect
                  width={boxW}
                  height={boxH}
                  rx={5}
                  ry={5}
                  fill="#c9d8e3"
                  fillOpacity={0.95}
                  stroke="#c9d8e3"
                  strokeWidth={1}
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

    </div>
  );
};

export const P4_ResponsiveCircularTreemap = ({ height = 400, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: "100%", height }}>
      <P4_CircularTreemap SVG_WIDTH={chartSize.width} SVG_HEIGHT={chartSize.height} {...props} />
    </div>
  );
};
