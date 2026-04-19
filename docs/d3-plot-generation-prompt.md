# Version: 1.0

# Date: 2026-04-09

# Plot Generation Prompt

Instruction: Use this prompt to generate new plots that follow the same structure as Plot2 on react-d3-page, using D3 and SVG.

---

Build a React + D3 chart component using the following structure. Use D3 only for math (`scaleBand`, `scaleLinear`, `max`, etc.) — never `d3.select`, `d3.append`, or any DOM manipulation. All rendering is JSX.

**File layout:** Create two files — `PlotN.jsx` (page wrapper) and `functions/PN_ChartType.jsx` (the chart component).

**Wrapper** (`PlotN.jsx`): define a `data` array of objects, a title, subtitle, and footnote. Render them as plain `<div>` elements above/below the chart component.

**Chart component**: define `MARGIN`, `SVG_WIDTH`, `SVG_HEIGHT` as constants. Derive `innerWidth`/`innerHeight`. Use `scaleBand` for categorical axis, `scaleLinear` for continuous. Render `<rect>` bars, `<text>` labels, `<circle>` datapoints, etc, if needed, and gridlines as mapped JSX. Define colors as named constants at the top.
