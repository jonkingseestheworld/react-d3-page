import { useState, useMemo } from 'react';
import { voronoiMapSimulation } from 'd3-voronoi-map';

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

function Plot5() {
  const [error, setError] = useState(null);
  const [cells, setCells] = useState(null);

  const SVG_WIDTH = 650;
  const SVG_HEIGHT = 500;
  const radius = 150;
  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;

  // Build voronoi treemap
  useMemo(() => {
    try {
      console.log('Creating voronoi treemap...');

      // Create data - API expects objects with properties
      const data = SOURCES.map((source, i) => ({
        source: source,
        weight: [150, 200, 180, 100, 120, 90, 110, 60, 40][i],
      }));

      console.log('Data:', data);

      // Create circular clip path
      const clipPath = [];
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        clipPath.push([
          radius * Math.cos(angle),
          radius * Math.sin(angle),
        ]);
      }

      console.log('Clip path created with', clipPath.length, 'points');

      // Create simulation
      const simulation = voronoiMapSimulation(data)
        .weight(d => d.weight)
        .clip(clipPath);

      console.log('Simulation created and configured');

      // Listen for 'end' event to get final result
      simulation.on('end', function() {
        console.log('Simulation ended');
        const state = simulation.state();
        console.log('State:', state);

        if (state && state.polygons && state.polygons.length > 0) {
          const renderCells = state.polygons.map((polygon, i) => ({
            source: data[i].source,
            weight: data[i].weight,
            polygon: polygon,
          }));
          console.log('Cells:', renderCells.length);
          setCells(renderCells);
          setError(null);
        }
      });

      console.log('Starting simulation...');
      // Run to completion
      simulation.tick(Infinity);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  }, []);

  const getCentroid = (polygon) => {
    if (!polygon || polygon.length === 0) return [0, 0];

    // Calculate the geometric center (simple average)
    let x = 0, y = 0;
    for (let p of polygon) {
      x += p[0];
      y += p[1];
    }
    return [x / polygon.length, y / polygon.length];
  };

  const getLabelPosition = (polygon) => {
    if (!polygon || polygon.length < 3) return getCentroid(polygon);

    // Use the centroid but also check if it's inside the polygon
    // For better centering, use the weighted centroid method
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
      <div style={{ width: '650px' }}>
        <div style={{ paddingLeft: '20px', paddingBottom: '10px', fontWeight: 'bold', fontSize: '20px', color: '#1f4f48' }}>
          Voronoi Treemap Test
        </div>

        <svg width={SVG_WIDTH} height={SVG_HEIGHT} style={{ border: '1px solid #ccc', display: 'block', margin: '0 auto' }}>
          <g transform={`translate(${centerX}, ${centerY})`}>
            {/* Background circle */}
            <circle cx={0} cy={0} r={radius} fill="none" stroke="#999" strokeWidth={1} opacity={0.3} />

            {/* Voronoi cells */}
            {cells && cells.map(cell => {
              if (!cell.polygon || cell.polygon.length === 0) return null;
              const pathData = cell.polygon.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join('') + 'Z';
              const [labelX, labelY] = getLabelPosition(cell.polygon);

              return (
                <g key={cell.source}>
                  <path
                    d={pathData}
                    fill={SOURCE_COLORS[cell.source]}
                    fillOpacity={0.8}
                    stroke="#fff"
                    strokeWidth={2}
                  />
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
                </g>
              );
            })}
          </g>
        </svg>

        {error && (
          <div style={{ color: 'red', marginTop: '10px', paddingLeft: '20px' }}>
            Error: {error}
          </div>
        )}

        {!cells && !error && (
          <div style={{ marginTop: '10px', paddingLeft: '20px', color: '#666' }}>
            Loading voronoi treemap...
          </div>
        )}

        {cells && (
          <div style={{ marginTop: '10px', paddingLeft: '20px', color: '#666', fontSize: '12px' }}>
            Voronoi treemap rendered with {cells.length} cells
          </div>
        )}

        <div style={{ paddingLeft: '20px', paddingTop: '15px', fontSize: '11px', color: '#5f5f5f' }}>
          Test visualization of d3-voronoi-map circular treemap
        </div>
      </div>
    </div>
  );
}

export default Plot5;
