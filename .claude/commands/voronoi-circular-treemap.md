<!-- version: 1.0.0 | updated: 2026-05-25 -->

# voronoi-circular-treemap

Scaffold a production-ready circular Voronoi treemap component using d3-voronoi-map, with best practices for weight normalization, polygon-to-source mapping, seeded rendering, and hover tooltips.

## Arguments

`$ARGUMENTS` format: `<ComponentName> [data-source]`

- First argument: component name, e.g. `P5_VoronoiTreemap` (must start with capital letter)
- Optional second argument: describe your data structure briefly (default: generic "energy consumption data")

Parse the arguments now. The component name is: `$ARGUMENTS`

---

## Before You Start: Data Requirements

Your data must be an array of objects with:
- `year` (number): the time period
- Multiple numeric fields representing categories/sources (e.g., `coal`, `oil`, `gas`, etc.)

Example structure:
```js
[
  { year: 2020, coal: 1000, oil: 1500, gas: 1200, solar: 50, wind: 80, ... },
  { year: 2021, coal: 950, oil: 1400, gas: 1300, solar: 120, wind: 200, ... },
  ...
]
```

The component will:
1. Filter out sources with 0 value (they won't appear in the treemap)
2. Normalize weights to percentages for stable voronoi algorithm behavior
3. Use a seeded PRNG for deterministic rendering across refreshes
4. Hide labels for cells <3% share (tooltip still works)
5. Show proportional cell sizes with hover tooltips displaying source, TWh, and percentage

---

## Instructions

Create the file `src/Plots/functions/$ARGUMENTS.jsx` with the following content. Replace every `$ARGUMENTS` with the component name and update SOURCES/LABELS/COLORS as needed.

```jsx
import { useRef, useState, useEffect } from 'react';
import { voronoiMapSimulation } from 'd3-voronoi-map';
import { useDimensions } from './use-dimensions';

// TODO: Update these to match your data structure
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

export const $ARGUMENTS = ({ data, SVG_WIDTH, SVG_HEIGHT, selectedYear }) => {
  const [cells, setCells] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const yearRow = data?.find(d => d.year === selectedYear) || data?.[data.length - 1];
  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;
  const radius = Math.min(SVG_WIDTH, SVG_HEIGHT) / 2 * 0.75;

  const total = yearRow ? SOURCES.reduce((sum, source) => sum + (yearRow[source] || 0), 0) : 0;

  useEffect(() => {
    if (SVG_WIDTH === 0 || SVG_HEIGHT === 0 || !yearRow) {
      setCells(null);
      return;
    }

    try {
      // Normalize weights to percentages for stable voronoi algorithm behavior
      // Filter out zero-value sources to reduce noise
      const voronoiData = SOURCES.map(source => {
        const value = yearRow[source] || 0;
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return {
          source: source,
          weight: value,
          normalizedWeight: percentage,
        };
      }).filter(d => d.weight > 0);

      // Create circular clip path (100 points around the circle boundary)
      const clipPath = [];
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        clipPath.push([
          radius * Math.cos(angle),
          radius * Math.sin(angle),
        ]);
      }

      // Seeded PRNG for deterministic results across renders
      let seed = 42;
      const seededPrng = () => {
        seed = (seed * 1664525 + 1013904223) & 0xffffffff;
        return (seed >>> 0) / 0xffffffff;
      };

      // Create simulation with normalized weights and high iteration count
      const simulation = voronoiMapSimulation(voronoiData)
        .weight(d => d.normalizedWeight)
        .clip(clipPath)
        .prng(seededPrng)
        .maxIterationCount(500);

      simulation.on('end', function() {
        const state = simulation.state();
        if (state && state.polygons && state.polygons.length > 0) {
          // Calculate polygon areas using shoelace formula
          const polygonsWithArea = state.polygons.map((polygon, i) => {
            const area = Math.abs(
              polygon.reduce((sum, p, idx) => {
                const next = polygon[(idx + 1) % polygon.length];
                return sum + (p[0] * next[1] - next[0] * p[1]);
              }, 0) / 2
            );
            return { polygon, area, index: i };
          });

          // Match polygons to source data by sorting both by size/weight
          // This ensures largest polygon → largest source, etc.
          const sortedPolygons = [...polygonsWithArea].sort((a, b) => b.area - a.area);
          const sortedData = [...voronoiData].sort((a, b) => b.normalizedWeight - a.normalizedWeight);

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
      <div style={{ textAlign: 'center', marginBottom: 6, color: AXIS_COLOR }}>
        <div style={{ fontSize: 12, textAlign: 'left' }}>
          Total: {total.toLocaleString('en-US', { maximumFractionDigits: 0 })} TWh
        </div>
      </div>

      <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
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

          {/* Hover tooltip */}
          {tooltip && (() => {
            const percentage = total > 0 ? (tooltip.weight / total * 100).toFixed(1) : 0;
            const lines = [
              SOURCE_LABELS[tooltip.source],
              `${tooltip.weight.toLocaleString('en-US', { maximumFractionDigits: 0 })} TWh`,
              `${percentage}%`,
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

export const Responsive$ARGUMENTS = ({ height = 400, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: "100%", height }}>
      <$ARGUMENTS SVG_WIDTH={chartSize.width} SVG_HEIGHT={chartSize.height} {...props} />
    </div>
  );
};
```

---

## Setup Steps

1. **Install dependency** (if not already installed):
   ```bash
   npm install d3-voronoi-map
   ```

2. **Update SOURCES, SOURCE_LABELS, and SOURCE_COLORS** to match your data fields

3. **Pass your data** to the component:
   ```jsx
   import { P5_VoronoiTreemap } from './functions/P5_VoronoiTreemap';
   
   <P5_VoronoiTreemap 
     data={energyData} 
     SVG_WIDTH={650} 
     SVG_HEIGHT={500} 
     selectedYear={2024}
   />
   ```

   Or use the responsive wrapper:
   ```jsx
   import { ResponsiveP5_VoronoiTreemap } from './functions/P5_VoronoiTreemap';
   
   <ResponsiveP5_VoronoiTreemap data={energyData} selectedYear={2024} height={500} />
   ```

---

## Key Implementation Details

### Weight Normalization
Raw data values (e.g., 1–40,000 TWh) cause the voronoi algorithm to struggle with extreme ratios. Converting to percentages (0–100) provides stable proportions:
```js
normalizedWeight: (value / total) * 100
```

### Deterministic Rendering
Voronoi simulations use randomness. A seeded PRNG ensures consistent cell positions across page refreshes:
```js
let seed = 42;
const seededPrng = () => {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff;
};
simulation.prng(seededPrng).maxIterationCount(500);
```

### Polygon-to-Source Matching
The voronoi simulation doesn't guarantee `state.polygons[i]` matches `voronoiData[i]`. Match by sorting both arrays by size and pairing by sorted index:
```js
const sortedPolygons = [...polygonsWithArea].sort((a, b) => b.area - a.area);
const sortedData = [...voronoiData].sort((a, b) => b.normalizedWeight - a.normalizedWeight);
const renderCells = sortedPolygons.map((pw, idx) => ({
  source: sortedData[idx].source,
  ...
}));
```

### Label Visibility
Small cells (<3% share) won't have room for readable text. Hide them and rely on hover tooltips:
```js
const showLabel = percentage >= 3;
{showLabel && <text>...</text>}
```

### Tooltip Edge Detection
Tooltips are positioned with edge detection to prevent overflow beyond the circular boundary:
```js
const bx = tooltip.x + pad + boxW > radius ? tooltip.x - pad - boxW : tooltip.x + pad;
const by = tooltip.y + pad + boxH > radius ? tooltip.y - pad - boxH : tooltip.y + pad;
```

---

## Customization

- **Seed value**: Change `let seed = 42` to any number for different (but still deterministic) layouts
- **Label threshold**: Adjust `percentage >= 3` to show/hide labels for different size ranges
- **Iteration count**: Increase `maxIterationCount(500)` if cell positions look unstable
- **Colors**: Update SOURCE_COLORS object to match your brand
- **Tooltip style**: Modify the tooltip rect and text styling (fill, opacity, font, etc.)

