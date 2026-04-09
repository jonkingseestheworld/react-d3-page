import P1_Barplot from './functions/P1_Barplot';

const data = [
  { country: "United States", students: 68 },
  { country: "France", students: 21 },
  { country: "United Kingdom", students: 21 },
  { country: "Germany", students: 20 },
  { country: "Switzerland", students: 13 },
  { country: "Spain", students: 10 },
  { country: "Netherlands", students: 9 },
  { country: "India", students: 9 },
  { country: "Singapore", students: 8 },
  { country: "Ireland", students: 8 },
  { country: "Sweden", students: 7 },
  { country: "Australia", students: 7 },
  { country: "Canada", students: 6 },
  { country: "Finland", students: 5 },
  { country: "Mexico", students: 4 },
  { country: "Brazil", students: 4 },
  { country: "Saudi Arabia", students: 3 },
  { country: "Romania", students: 3 },
  { country: "Philippines", students: 3 },
  { country: "New Zealand", students: 3 },
];

const countryFlags = [
  { country: "United States",  flag: "🇺🇸" },
  { country: "France",         flag: "🇫🇷" },
  { country: "United Kingdom", flag: "🇬🇧" },
  { country: "Germany",        flag: "🇩🇪" },
  { country: "Switzerland",    flag: "🇨🇭" },
  { country: "Spain",          flag: "🇪🇸" },
  { country: "Netherlands",    flag: "🇳🇱" },
  { country: "India",          flag: "🇮🇳" },
  { country: "Singapore",      flag: "🇸🇬" },
  { country: "Ireland",        flag: "🇮🇪" },
  { country: "Sweden",         flag: "🇸🇪" },
  { country: "Australia",      flag: "🇦🇺" },
  { country: "Canada",         flag: "🇨🇦" },
  { country: "Finland",        flag: "🇫🇮" },
  { country: "Mexico",         flag: "🇲🇽" },
  { country: "Brazil",         flag: "🇧🇷" },
  { country: "Saudi Arabia",   flag: "🇸🇦" },
  { country: "Romania",        flag: "🇷🇴" },
  { country: "Philippines",    flag: "🇵🇭" },
  { country: "New Zealand",    flag: "🇳🇿" },
];

// Build a lookup map for O(1) access
const flagMap = Object.fromEntries(countryFlags.map(d => [d.country, d.flag]));

// Merge: add flag into each data entry
const dataWithFlags = data.map(d => ({ ...d, flag: flagMap[d.country] ?? d.country }));


function Plot1() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
      <div style={{ marginLeft: '0px' }}>
         <h1 style={{ marginLeft: '0px',  textAlign: 'center' }}>We the Data Viz Aficionados </h1>
         <h3 style={{ marginLeft: '0px', textAlign: 'center' }}>Where are we based? </h3>
         <div style={{ '--plot-bar-radius': '5px' }}>
           <P1_Barplot data={dataWithFlags}  />
         </div>
      </div> 
    </div>
  )
}

export default Plot1;
