import P2_Barplot from './functions/P2_Barplot';


const data = [
  { count: 6,  name: "Hantavirus" },
  { count: 7,  name: "Tularemia" },
  { count: 7,  name: "Dengue" },
  { count: 9,  name: "Ebola" },
  { count: 11, name: "E. coli" },
  { count: 15, name: "Tuberculosis" },
  { count: 17, name: "Salmonella" },
  { count: 18, name: "Vaccinia" },
  { count: 54, name: "Brucella" },
];


{/*Define colour scheme*/}
const FOOTNOTE_COLOR = "#5f5f5f";

function Plot2() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
      {/* Align all text to the left perfectly to the plot */}
      <div style={{ width: '650px' }}>
        <svg width="650" height="10" style={{ display: 'block', paddingLeft: '20px', marginBottom: '0px' }}>
          <rect x={0} y={0} width={30} height={10} fill="#e3120b" />
          <line x1={0} x2={650} y1={0} y2={0} stroke="#e3120b" strokeWidth={1.5} />
        </svg>
        <div style={{ paddingLeft: '20px', paddingBottom: '10px', fontWeight: 'bold', fontSize: '20px',color: 'black', textAlign: 'left' }}>Escape artists</div>
        <div style={{ paddingLeft: '20px', paddingBottom: '15px', fontSize: '16px', color: 'black', textAlign: 'left' }}>Number of laboratory-acquired infections, 1970-2021</div>
        <P2_Barplot data={data} />
        <div style={{ paddingLeft: '20px', paddingTop: '0px', fontSize: '11px', color: FOOTNOTE_COLOR, textAlign: 'left' }}>Sources: Laboratory-Acquired Infection Database; American Biological Safety Association</div>
        <div style={{ paddingLeft: '20px', paddingTop: '0px', fontSize: '11px', color: FOOTNOTE_COLOR, textAlign: 'left' }}>The Economist</div>

      </div>
    </div>
  );
}

export default Plot2;
