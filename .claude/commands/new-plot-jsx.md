<!-- version: 1.1.0 | updated: 2026-04-09 -->

# new-plot-jsx

Scaffold an empty PlotX.jsx wrapper file in the current project's `src/Plots/` directory.

## Arguments
`$ARGUMENTS` format: `<PlotName>`

- Must start with "Plot" followed by a number or identifier, e.g. `Plot5`
- If no argument is provided, ask the user for the plot name before proceeding.

Parse the argument now. The plot name is: `$ARGUMENTS`

---

## Instructions

Create the file `src/Plots/$ARGUMENTS.jsx` in the current working directory with the following content exactly. Replace every occurrence of `$ARGUMENTS` with the actual plot name supplied.

```jsx
import { } from 'd3';

const data = [
  // TODO: add data objects here, e.g. { name: 'A', value: 10 }
];

const FOOTNOTE_COLOR = "#5f5f5f";

function $ARGUMENTS() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
      <div style={{ width: '650px' }}>

        {/* Red accent header bar */}
        <svg width="650" height="10" style={{ display: 'block', paddingLeft: '20px', marginBottom: '0px' }}>
          <rect x={0} y={0} width={30} height={10} fill="#e3120b" />
          <line x1={0} x2={650} y1={0} y2={0} stroke="#e3120b" strokeWidth={1.5} />
        </svg>

        {/* Title */}
        <div style={{ paddingLeft: '20px', paddingBottom: '10px', fontWeight: 'bold', fontSize: '20px', color: 'black', textAlign: 'left' }}>
          Chart Title
        </div>

        {/* Subtitle */}
        <div style={{ paddingLeft: '20px', paddingBottom: '15px', fontSize: '16px', color: 'black', textAlign: 'left' }}>
          Chart subtitle or axis description
        </div>

        {/* TODO: import and render your chart component here */}
        {/* <$ARGUMENTS_Chart data={data} /> */}

        {/* Footnote */}
        <div style={{ paddingLeft: '20px', paddingTop: '0px', fontSize: '11px', color: FOOTNOTE_COLOR, textAlign: 'left' }}>
          Source: TODO
        </div>

      </div>
    </div>
  );
}

export default $ARGUMENTS;
```

After writing the file, confirm the file was created and remind the user to:
1. Add their data to the `data` array
2. Create a chart component in `src/Plots/functions/` (e.g. `$ARGUMENTS_Chart.jsx`)
3. Import and render it where the TODO comment is
