<!-- version: 1.1.0 | updated: 2026-04-19 -->

# code-review-d3

Code review a React + D3 data visualisation file or component.

## Arguments

`$ARGUMENTS` — a file path, or leave blank to review the currently open file.

---

## Core principle to enforce

**D3 handles the math. React handles the rendering.**

- D3 is allowed for: `scaleLinear`, `scaleBand`, `scaleSqrt`, `scaleLog`, `max`, `min`, `extent`, `ticks()`, `nice()`, path generators, etc.
- D3 is NOT allowed for: `d3.select`, `d3.append`, `d3.attr`, `d3.style`, `.enter()`, `.exit()` — any DOM manipulation.
- All SVG elements must be rendered as JSX: `<rect>`, `<circle>`, `<line>`, `<text>`, `<g>`, `<path>`, etc.

---

## Review checklist

Read the file(s) in `$ARGUMENTS` (or the current file if blank), then check each of the following. Report findings grouped by category. For each issue found, include the line number and a short fix suggestion.

### 1. D3 usage — math only

- [ ] No `d3.select`, `d3.append`, `d3.attr`, or any DOM manipulation
- [ ] Scales are constructed with D3 (`scaleLinear`, `scaleBand`, `scaleSqrt`, etc.) and used only for value mapping
- [ ] `ticks()` is called on scale objects, not hardcoded tick arrays

### 2. Scale correctness

- [ ] All scale `.domain()` and `.range()` values are correctly ordered (e.g. y-axis range is `[innerHeight, 0]` for top-to-bottom)
- [ ] `scaleSqrt` (not `scaleLinear`) is used when bubble/circle area encodes a quantity
- [ ] `nice()` is applied where appropriate to produce clean axis labels
- [ ] No `pixelsPerTick` value is divided twice — once in the parent and again inside the axis component (double-division bug)
- [ ] Scale domain minimum is set appropriately — not always `0` (e.g. life expectancy starting at 30 makes more sense than 0)

### 3. React rendering

- [ ] Every `.map()` call has a unique `key` prop on the outermost element
- [ ] No duplicate `key` props (e.g. gridline `<line>` and tick `<text>` both using `key={tick}` as siblings — wrap in `<g key={tick}>`)
- [ ] Expensive computations (`.sort()`, scale construction) inside render are wrapped in `useMemo` if data is large or updates frequently
- [ ] State is scoped to the right component — tooltip/hover state belongs in the chart component, not the wrapper

### 4. Layout & overflow

- [ ] `MARGIN`, `SVG_WIDTH`, `SVG_HEIGHT`, `innerWidth`, `innerHeight` are defined as named constants, not magic numbers inline
- [ ] Tooltip flip logic accounts for MARGIN offset so it doesn't clip at SVG edges
- [ ] Population/size legends don't overlap data at realistic data densities
- [ ] Long text labels (country names, axis labels) don't overflow SVG bounds

### 5. Separation of concerns

- [ ] Wrapper (`PlotN.jsx`) only contains: data definition, title/subtitle/footnote divs, and the chart component call
- [ ] Chart component (`functions/PN_*.jsx`) contains: scales, SVG, all rendering logic
- [ ] Axis components (`AxisBottom.jsx`, `AxisLeft.jsx`) are generic — domain-specific formatting (e.g. `>=1000 → k`) should be passed in as a formatter prop, not hardcoded
- [ ] Color constants (`AXIS_COLOR`, `GRIDLINE_COLOR`, etc.) are not duplicated across multiple files — flag if the same hex appears in 3+ places

### 6. Interactivity

- [ ] Clickable SVG elements have `style={{ cursor: 'pointer' }}`
- [ ] Tooltip/overlay elements have `style={{ pointerEvents: 'none' }}` so they don't block mouse events on data below
- [ ] Toggle interactions reset cleanly (e.g. clicking an active filter deselects it, returning to "show all")

### 7. Accessibility (flag as advisory, not blocking)

- [ ] SVG has an `aria-label` or `<title>` describing the chart
- [ ] Interactive `<g>` elements have `tabIndex` and `onKeyDown` for keyboard users

---

## Output format

Summarise findings as:

**PASS** — no issues found in this category
**WARN** — minor issue, worth fixing
**FAIL** — clear bug or principle violation, fix before shipping

End with an overall verdict and the top 3 priority fixes if any issues were found.
