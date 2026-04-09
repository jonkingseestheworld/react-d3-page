import { ResponsiveBar } from "@nivo/bar";

const data = [
  { country: "France", value: 42 },
  { country: "Germany", value: 35 },
  { country: "Spain", value: 28 },
  { country: "Italy", value: 31 },
  { country: "UK", value: 22 },
];


function Plot4() {
  return (

      <div style={{ height: 400, width: 500 }}>
        <h1>Hello</h1>
        <ResponsiveBar
          data={data}
          keys={["value"]}
          indexBy="country"
        />
      </div>
  );
}


export default Plot4;
