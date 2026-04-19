import { data } from './data/data_gapminder';
import P3_Bubbleplot from './functions/P3_Bubbleplot';

const FOOTNOTE_COLOR = "#5f5f5f";

function Plot3() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
      <div style={{ width: '650px' }}>

        {/* Red accent header bar */}
        {/*
        <svg width="650" height="10" style={{ display: 'block', paddingLeft: '20px', marginBottom: '0px' }}>
          <rect x={0} y={0} width={30} height={10} fill="#e3120b" />
          <line x1={0} x2={650} y1={0} y2={0} stroke="#e3120b" strokeWidth={1.5} />
        </svg>
        */}

        <div style={{ paddingLeft: '50px', paddingBottom: '10px', fontWeight: 'bold', fontSize: '20px', color: 'black', textAlign: 'left' }}>
          Wealth &amp; Health of Nations
        </div>

        <div style={{ paddingLeft: '50px', paddingBottom: '10px', fontSize: '16px', color: 'black', textAlign: 'left' }}>
          Link between GDP per capita and life expectancy
        </div>

        <P3_Bubbleplot data={data} pixelsPerTickX={80} pixelsPerTickY={50}/>

        <div style={{ paddingLeft: '50px', paddingTop: '20px', fontSize: '11px', color: FOOTNOTE_COLOR, textAlign: 'left' }}>
          Source: Gapminder (2007) — data for 142 countries
        </div>

      </div>
    </div>
  );
}

export default Plot3;
