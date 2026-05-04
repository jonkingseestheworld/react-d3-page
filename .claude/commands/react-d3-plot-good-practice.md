<!-- version: 1.0.0 | updated: 2026-04-23 -->

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

### 5. useMemo for Expensive Calculations
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

### 6. Copy Before Mutating
```jsx
[...data].sort((a, b) => b.pop - a.pop)  // ✅ Good
```
Never mutate original arrays/props.

### 7. CSS Media Queries for Responsive Padding
```jsx
<style>{`
  .plot-title { padding-left: 50px; }
  @media (max-width: 768px) { .plot-title { padding-left: 15px; } }
`}</style>
```
Use kebab-case in CSS (`padding-left`, not `paddingLeft`).

### 8. Named Constants
```jsx
const MARGIN = { top: 30, right: 30, bottom: 50, left: 60 };
const AXIS_COLOR = "#5f5f5f";
const CONTINENT_COLORS = { Africa: "#e15759", ... };
```

### 9. State for Interactivity
```jsx
const [activeFilter, setActiveFilter] = useState(null);
const [tooltip, setTooltip] = useState(null);
```

## File Structure
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
- [ ] State for interactivity
- [ ] Mobile responsive CSS (768px breakpoint)
- [ ] Use `{...props}` forwarding
- [ ] Export default from PlotX.jsx
- [ ] Add to `plots.config.js`

## Reference
Plot3 exemplifies these patterns — use as a template.