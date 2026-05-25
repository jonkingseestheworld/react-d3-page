<!-- version: 1.2.0 | updated: 2026-05-24 -->

# React + D3 Plot Good Practice

Best practices for creating reusable, responsive React + D3 plots in this project.

## Core Patterns

### 1. Wrapper + Inner Component Pattern
```jsx
// Responsive wrapper — manages dimensions only
export const PlotX_Responsive = ({ height = 450, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);
  return (
    <div ref={chartRef} style={{ width: "100%", height }}>
      <PlotX_Chart SVG_WIDTH={chartSize.width} SVG_HEIGHT={chartSize.height} {...props} />
    </div>
  );
};

// Inner chart — D3 logic + React rendering
export const PlotX_Chart = ({ data, SVG_WIDTH, SVG_HEIGHT, pixelsPerTickX=80 }) => {
  // All D3 scales, axes, and SVG rendering here
};
```
Wrapper handles responsiveness; inner component handles chart logic. Use `{...props}` to forward props without manual drilling.

### 2. Separation: D3 for Math, React for Rendering
- **D3**: scales, domains, ranges, ticks, mathematical transformations
- **React**: SVG rendering, state (filters, tooltips), interactivity
- **Never**: `d3.select()`, `d3.append()`, DOM manipulation

### 3. Reusable Components (When Applicable)
Extract reusable pieces: axis components (if plot has axes), legend components, utility hooks.

Example axis signature:
```jsx
export const AxisBottom = ({ xScale, pixelsPerTick, innerHeight, label }) => { ... };
```
Axes compute ticks internally: `Math.floor(range / pixelsPerTick)`.

### 4. useDimensions Hook
```jsx
const chartRef = useRef(null);
const chartSize = useDimensions(chartRef);  // { width, height }
```
Tracks container size on mount and window resize. Safe for SSR (returns 0 before layout).

### 5. Rules of Hooks: Never Return Early Before Hooks

React tracks hooks **by position in the call order**, not by name. It keeps an internal linked list — slot 1, slot 2, slot 3 — and expects the same hook at the same slot on every render. An early `return null` cuts the render short, so any hooks after it are skipped. When dimensions later resolve and those hooks run, React sees a different count and throws a crash.

**The fix: compute dimensions safely with `Math.max(0, ...)`, run all hooks first, guard at the end.**

```jsx
// ✅ Correct
const [tooltipPos, setTooltipPos] = useState(null);

const innerWidth = Math.max(0, SVG_WIDTH - MARGIN.left - MARGIN.right);
const innerHeight = Math.max(0, SVG_HEIGHT - MARGIN.top - MARGIN.bottom);

const xScale = scaleLinear()...;
const yScale = scaleLinear()...;

const processedData = useMemo(() => ..., [data]);  // called before any return ✓

if (SVG_WIDTH === 0 || SVG_HEIGHT === 0) return null;  // guard AFTER all hooks
```

```jsx
// ❌ Wrong — useMemo skipped when dims are 0, hook count changes between renders
const [tooltipPos, setTooltipPos] = useState(null);
if (SVG_WIDTH === 0 || SVG_HEIGHT === 0) return null;
const processedData = useMemo(() => ..., [data]);  // never runs on first render
```

**Why `useDimensions` makes this easy to miss:** it returns `0` on mount, then resolves on the next frame. So render 1 hits the early return (only `useState` runs), render 2 doesn't (all hooks run) — React detects the count change and crashes.

**Performance note:** moving the guard after hooks means D3 scale calculations run once with 0-dimension inputs before returning null. This is negligible — it's one frame, and D3 scales are cheap. The real perf tool is `useMemo` itself (prevents recomputing on unrelated re-renders). If a memo contains genuinely expensive work, guard inside the memo rather than via early return:

```jsx
// Guard inside useMemo — hook is unconditional, but heavy work is skipped
const heavyResult = useMemo(() => {
  if (SVG_WIDTH === 0) return null;
  return expensiveComputation(data);
}, [data, SVG_WIDTH]);
```

### 6. useMemo for Expensive Calculations
Wrap complex computations (position calculations, legend layouts, etc.) in `useMemo` to avoid recalculating on every render:

```jsx
const positions = useMemo(() => {
  let curX = 0;
  return sizeLevels.map(({ pop, label }) => {
    const r = rScale(pop);
    const cx = curX + r;
    curX = cx + r + gap;
    return { r, cx, label };
  });
}, [rScale]);  // Only recalculates when rScale changes
```

### 7. Copy Before Mutating
```jsx
[...data].sort((a, b) => b.pop - a.pop)  // ✅ Good
```
Never mutate original arrays/props.

### 8. CSS Media Queries for Responsive Padding
```jsx
<style>{`
  .plot-title { padding-left: 50px; }
  @media (max-width: 768px) { .plot-title { padding-left: 15px; } }
`}</style>
```
Use kebab-case in CSS (`padding-left`, not `paddingLeft`).

### 9. Named Constants
```jsx
const MARGIN = { top: 30, right: 30, bottom: 50, left: 60 };
const AXIS_COLOR = "#5f5f5f";
const CONTINENT_COLORS = { Africa: "#e15759", ... };
```

### 10. State for Interactivity
```jsx
const [activeFilter, setActiveFilter] = useState(null);
const [tooltip, setTooltip] = useState(null);
```

### 10.5. Tooltips: Use HTML Divs, Not SVG Elements
Render tooltips as HTML divs with CSS classes, not SVG `<rect>` + `<text>`. HTML divs offer:
- **Styling flexibility** — CSS media queries, animations, borders, shadows
- **Cleaner code** — CSS classes vs inline SVG attributes
- **Better maintainability** — Separate concerns (layout CSS vs React logic)

**Pattern:**
```jsx
const tooltipStyles = `
  .chart-tooltip {
    position: absolute;
    background: #eee;
    padding: 10px 12px;
    border-radius: 4px;
    z-index: 1000;
  }
  .chart-tooltip-row { padding: 2px 0; }
  .chart-tooltip-row:first-child { font-weight: bold; }
`;

export const Chart = ({ data, SVG_WIDTH, SVG_HEIGHT }) => {
  const [tooltipData, setTooltipData] = useState(null);
  const chartRef = useRef(null);

  const handleMouseEnter = (d) => {
    setTooltipData({
      label: d.name,
      value: d.value,
      xPos: MARGIN.left + xScale(d.value) + 10,
      yPos: MARGIN.top + yScale(d.name) - 50
    });
  };

  return (
    <>
      <style>{tooltipStyles}</style>
      <div ref={chartRef} style={{ position: 'relative', display: 'inline-block' }}>
        <svg>
          {/* SVG content */}
          <rect onMouseEnter={() => handleMouseEnter(d)} />
        </svg>

        {/* Tooltip outside SVG */}
        {tooltipData && (
          <div className="chart-tooltip" style={{ left: `${tooltipData.xPos}px`, top: `${tooltipData.yPos}px` }}>
            <div className="chart-tooltip-row">{tooltipData.label}</div>
            <div className="chart-tooltip-row">{tooltipData.value}</div>
          </div>
        )}
      </div>
    </>
  );
};
```

**Smart positioning:** For long bars/elements that would cause overflow, detect width and reposition tooltip below instead of to the right:
```jsx
const barWidth = xScale(value);
const tooltipWidthEstimate = 220;
const isLongBar = MARGIN.left + barWidth + tooltipWidthEstimate > SVG_WIDTH;

if (isLongBar) {
  xPos = Math.max(MARGIN.left, MARGIN.left + barWidth - tooltipWidthEstimate + 20);
  yPos = MARGIN.top + yScale(name) + barHeight + 8;  // Position below
} else {
  xPos = MARGIN.left + barWidth + 10;
  yPos = MARGIN.top + yScale(name) - 50;  // Position to the right
}
```

### 11. Multi-chart Synchronization via Parent State

When you have multiple charts that need to interact (e.g., hovering one chart affects another), use **shared state in the parent** + **callback props** to communicate back. Each child computes its own coordinates independently using its own scales.

**Pattern:**
1. Parent holds the shared state: `const [hoveredYear, setHoveredYear] = useState(null)`
2. Pass state and setter to both chart children as props
3. Children call `onHover?.(value)` to update parent state
4. Each child uses the shared prop and **its own scale** to compute visual position (e.g., `xScale(hoveredYear)`)
5. Child can also communicate back to parent via callbacks (e.g., `onTooltipPos`) for parent-rendered overlays

**Example — Plot4 with two synchronized charts:**

```jsx
// Parent: Plot4.jsx
export default function Plot4() {
  const [hoveredYear, setHoveredYear] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);

  return (
    <>
      <P4_ResponsiveStackedAreaChart
        data={data}
        hoveredYear={hoveredYear}
        onHover={setHoveredYear}
        onTooltipPos={setTooltipPos}
      />
      <P4_ResponsiveRenewablesLineChart
        data={data}
        hoveredYear={hoveredYear}
        onHover={setHoveredYear}
        onTooltipPos={setTooltipPos}
      />
      {hoveredYear && tooltipPos !== null && (
        <YearTooltip year={hoveredYear} x={tooltipPos} />
      )}
    </>
  );
}

// Child chart inner component
export const P4_StackedAreaChart = ({
  data,
  SVG_WIDTH,
  SVG_HEIGHT,
  hoveredYear,
  onHover,
  onTooltipPos,
}) => {
  const xScale = scaleLinear()
    .domain([data[0].year, data[data.length - 1].year])
    .range([0, innerWidth]);

  const handleMouseMove = (e) => {
    const x = e.clientX - rect.left - MARGIN.left;
    const year = xScale.invert(x);
    // ... find closest year ...
    onHover?.(closestYear);
    onTooltipPos?.(x);  // Communicate pixel position back to parent
  };

  return (
    <svg>
      {/* Chart content */}

      {/* Vertical line uses shared hoveredYear, scaled independently */}
      {hoveredYear !== null && (
        <line
          x1={xScale(hoveredYear)}
          x2={xScale(hoveredYear)}
          y1={0}
          y2={innerHeight}
          stroke="#666"
          strokeDasharray="4,4"
        />
      )}
    </svg>
  );
};
```

**Key insight:** Each chart has its own `xScale` that maps year → pixel position. So `xScale(hoveredYear)` gives the correct x-coordinate in *that* chart's coordinate space. Both charts independently compute the same x position in their own domains, keeping the visual line synchronized.

**When to use callbacks:**
- `onHover(value)` — child updates shared state in parent (what data point was selected)
- `onTooltipPos(x)` — child communicates pixel/DOM position back, parent renders overlay (avoid having tooltip HTML inside child to prevent overflow/stacking issues)


```
src/Plots/
├── PlotX.jsx                    # Wrapper (title, subtitle, responsive setup)
├── functions/
│   ├── PlotX_Chart.jsx          # Inner chart (D3 logic)
│   ├── AxisBottom.jsx           # Reusable (when needed)
│   └── use-dimensions.jsx       # Reusable hook
└── plots.config.js              # Add label: PlotX: 'Chart Name'
```

## Checklist for New Plots
- [ ] Responsive wrapper with `useDimensions`
- [ ] Inner chart accepts `SVG_WIDTH`, `SVG_HEIGHT` as props
- [ ] Extract reusable components (axes, legends) when applicable
- [ ] Named constants for dimensions, colors
- [ ] D3 scales with proper domains/ranges
- [ ] React-only rendering (no DOM manipulation)
- [ ] Copy data before sorting: `[...data].sort(...)`
- [ ] Wrap expensive calculations in `useMemo`
- [ ] All hooks called before any early return — no `return null` before `useMemo`/`useCallback`
- [ ] State for interactivity
- [ ] Mobile responsive CSS (768px breakpoint)
- [ ] Use `{...props}` forwarding
- [ ] Export default from PlotX.jsx
- [ ] Add to `plots.config.js`

## Reference
Plot3 exemplifies these patterns — use as a template.