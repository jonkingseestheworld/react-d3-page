Ready for review
Select text to add comments on the plan
Plan: Plot4 Energy Dashboard — Two Side-by-Side Charts
Context
The user wants to convert the empty Plot4.jsx scaffold into a full-width dashboard with two D3-powered charts side by side:

Left: Stacked area chart — global energy mix (all sources) over time
Right: Line chart — rise of renewables over time (nuclear, hydro, solar, wind, biofuel, other renewable)
Data comes from src/Plots/data/data_energy.js (per-country, per-year records in TWh). Both charts aggregate across all countries per year.

Architecture
Following the wrapper + inner component pattern from react-d3-plot-good-practice.md:

src/Plots/
├── Plot4.jsx # Dashboard wrapper (title bar + flex layout)
└── functions/
├── P4_StackedAreaChart.jsx # Responsive wrapper + inner stacked area chart
└── P4_RenewablesLineChart.jsx # Responsive wrapper + inner line chart
Reuse: AxisBottom.jsx, AxisLeft.jsx, use-dimensions.jsx (all existing).

Data Aggregation (in Plot4.jsx, memoized)
const yearlyData = useMemo(() => {
const byYear = {};
data.forEach(d => {
if (!byYear[d.year]) byYear[d.year] = { year: d.year, coal:0, oil:0, gas:0, nuclear:0, hydro:0, solar:0, wind:0, biofuel:0, other_renewable:0 };
SOURCES.forEach(k => { byYear[d.year][k] += d[k]; });
});
return Object.values(byYear).sort((a,b) => a.year - b.year);
}, []);
Both charts receive this pre-aggregated yearlyData array.

Left Chart: P4_StackedAreaChart.jsx
Inner component P4_StackedArea_Chart:

d3.stack().keys(ALL_SOURCES) on yearlyData
scaleLinear x: [minYear, maxYear] → [0, innerWidth]
scaleLinear y: [0, maxTotal] → [innerHeight, 0]
d3.area() path generator, .x, .y0, .y1 set from scales
React renders <path> per stacked layer
Legend (right side): colored squares + source labels
Reuse AxisBottom and AxisLeft
Responsive wrapper P4_StackedAreaChart_Responsive:

useDimensions hook on container div
Passes SVG_WIDTH, SVG_HEIGHT to inner component
Colors (fossil dark → renewable light):

{ coal: '#3d3d3d', oil: '#8b5e3c', gas: '#c9956c', nuclear: '#9467bd', hydro: '#4878d0', solar: '#f4c030', wind: '#6dbf67', biofuel: '#44a868', other_renewable: '#98df8a' }
Right Chart: P4_RenewablesLineChart.jsx
Inner component P4_RenewablesLine_Chart:

RENEWABLE_SOURCES = ['nuclear', 'hydro', 'solar', 'wind', 'biofuel', 'other_renewable']
scaleLinear x: [minYear, maxYear] → [0, innerWidth]
scaleLinear y: [0, maxRenewable] → [innerHeight, 0]
d3.line() per source, React renders <path> for each
Legend (top right): colored line segments + labels
Reuse AxisBottom and AxisLeft
Colors: same palette as stacked chart for consistency.

Plot4.jsx (Dashboard Wrapper)
Full-width responsive dashboard, not constrained to 650px
Flex layout: two charts side by side, each ~50% (with flex: 1, minWidth: 0)
Title: "Global Energy Mix" + subtitle at top
Each chart has its own subtitle below the title
Mobile: stack vertically with CSS media query at 768px
plots.config.js
Add: Plot4: 'Energy Dashboard'

Files to Modify / Create
src/Plots/Plot4.jsx — Replace scaffold with dashboard layout + data aggregation
src/Plots/functions/P4_StackedAreaChart.jsx — New: stacked area chart (inner + wrapper)
src/Plots/functions/P4_RenewablesLineChart.jsx — New: renewables line chart (inner + wrapper)
src/Plots/plots.config.js — Add Plot4: 'Energy Dashboard'
Verification
Run npm run dev, open Plot4. Verify:

Both charts render side by side on laptop
Charts stack vertically on mobile (narrow viewport)
Stacked area shows all 9 sources with correct colors and legend
Line chart shows 6 renewable lines with legend
Both charts resize when browser window resizes
Y-axis labeled in TWh, X-axis shows year range
