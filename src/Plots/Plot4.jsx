import { useMemo, useState } from 'react';
import { RoughNotation } from 'react-rough-notation';
import { data } from './data/data_energy';
import { P4_ResponsiveStackedAreaChart } from './functions/P4_StackedAreaChart';
import { P4_ResponsiveRenewablesLineChart } from './functions/P4_RenewablesLineChart';
import { P4_ResponsiveCountryBarChart } from './functions/P4_CountryBarChart';
import { P4_ResponsiveDonutChart } from './functions/P4_DonutChart';

// Plot4 Color Palette
const ROOT_BG_COLOR = "#F2DDCC";      // Root/page background (warm beige)
const CARD_COLOR = "#edd0c4";         // Chart cards (warm coral)
const PAGE_TITLE_COLOR = "#053614";  // Page title (dark teal)
const TITLE_COLOR = "#02544e";        // Title (dark)
const SUBTITLE_COLOR = "#555555";     // Subtitle (gray)
const FOOTNOTE_COLOR = "#666666";     // Footnote (gray)
const FOOTER_TEXT_COLOR = "#651e00";  // Footer text (warm brown)
const YEAR_HIGHLIGHT_COLOR = "#FCAC89"; // Year highlight (bright yellow)

function Plot4() {
  // Use pre-calculated World totals from the data
  const yearlyData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data
      .filter(d => d.country === 'World')
      .sort((a, b) => a.year - b.year);
  }, []);

  const [selectedYear, setSelectedYear] = useState(() => {
    if (!data || data.length === 0) return 2024;
    return Math.max(...data.filter(d => d.country !== 'World').map(d => d.year));
  });

  // Top 10 countries by energy use in the selected year
  const countryData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data
      .filter(d => d.country !== 'World' && d.year === selectedYear)
      .sort((a, b) => b.primary_energy - a.primary_energy)
      .slice(0, 10);
  }, [selectedYear]);

  const CHART_HEIGHT = 400;

  return (
    <>
      <style>{`
        body {
          background-color: ${ROOT_BG_COLOR};
        }
        #root {
          background-color: ${ROOT_BG_COLOR};
        }
        .site-footer {
          color: ${FOOTER_TEXT_COLOR};
          border-top-color: ${FOOTER_TEXT_COLOR};
        }
        .site-footer p {
          color: ${FOOTER_TEXT_COLOR};
        }
        .plot4-container {
          width: 95%;
          box-sizing: border-box;
          background-color: ${ROOT_BG_COLOR};
          border-radius: 12px;
          padding-top: 10px;
          padding-bottom: 30px;

        }
        .plot4-title {
          padding-left: 20px;
          color: ${TITLE_COLOR};
          font-size: 30px;
        }
        .plot4-subtitle {
          padding-left: 20px;
          color: ${SUBTITLE_COLOR};
        }
        .plot4-charts {
          display: flex;
          gap: 35px;
          margin-top: 20px;
        }
        .plot4-chart-wrapper {
          flex: 1;
          min-width: 0;
          background-color: ${CARD_COLOR};
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }
        .plot4-chart-title {
          padding-left: 0;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
          color: ${TITLE_COLOR};
          text-align: left;
        }
        .plot4-chart-subtitle {
          padding-left: 0;
          font-size: 12px;
          font-weight: 400;
          margin-bottom: 12px;
          color: ${SUBTITLE_COLOR};
          text-align: left;
        }
        .plot4-year-chosen {
          align-items: 'center'; 
          font-weight: 600; 
          font-size: 20px; 
          color: ${TITLE_COLOR};
          margin-top: 10px;
          margin-bottom: 10px; 
        }
        .plot4-year-slider {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 auto 40px auto;
          font-size: 12px;
          color: ${SUBTITLE_COLOR};
          max-width: 500px;
        }
        .plot4-year-slider input[type="range"] {
          accent-color: ${YEAR_HIGHLIGHT_COLOR};
        }
        .plot4-footnote {
          padding-left: 0;
          padding-top: 20px;
          font-size: 11px;
          color: ${FOOTNOTE_COLOR};
        }
        @media (max-width: 768px) {
          .plot4-container {
            padding: 0 10px;
          }
          .plot4-title {
            padding-left: 15px;
            font-size: 18px;
          }
          .plot4-subtitle {
            padding-left: 15px;
            font-size: 13px;
          }
          .plot4-charts {
            flex-direction: column;
            gap: 40px;
          }
          .plot4-chart-title {
            padding-left: 0;
          }
          .plot4-footnote {
            padding-left: 15px;
            padding-top: 15px;
          }
        }
      `}</style>
      <div className="plot4-container" style={{ marginTop: '5px' }}>

          <div className="plot4-title" style={{ paddingBottom: '5px', fontWeight: 'bold', color: PAGE_TITLE_COLOR, textAlign: 'left' }}>
            Global Energy Mix
          </div>

          <div className="plot4-subtitle" style={{ paddingBottom: '10px', fontSize: '16px', color: SUBTITLE_COLOR, textAlign: 'left' }}>
          Explore global data on where our energy comes from, and how it is changing.
          </div>

          <div className="plot4-charts">
            <div className="plot4-chart-wrapper">
              <div className="plot4-chart-title">Global Energy Consumption by Source Over Time</div>
              <div className="plot4-chart-subtitle">Measured in terawatt-hours (TWh), using the substitution method</div>
              <P4_ResponsiveStackedAreaChart data={yearlyData} height={CHART_HEIGHT} />
            </div>
            <div className="plot4-chart-wrapper">
              <div className="plot4-chart-title">Renewable Energy Growth</div>
              <div className="plot4-chart-subtitle">The share of energy from renewable sources has increased massively over the past few decades, specifically with wind and solar powers.</div>
              <P4_ResponsiveRenewablesLineChart data={yearlyData} height={CHART_HEIGHT} />
            </div>
          </div>

          <div className="plot4-charts" style={{ marginTop: '30px' }}>
            <div className="plot4-chart-wrapper">

              {/* Year label */}
              <div className="plot4-year-chosen">
                YEAR: <RoughNotation key={selectedYear} type="highlight" color={YEAR_HIGHLIGHT_COLOR} show={true} animationDuration={400}>{selectedYear}</RoughNotation>
              </div>

              {/* Shared year slider */}
              <div className="plot4-year-slider">
                <span style={{ fontWeight: 'bold', minWidth: 40 }}>1965</span>
                <input
                  type="range"
                  min={yearlyData.length > 0 ? yearlyData[0].year : 1965}
                  max={yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].year : 2024}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(+e.target.value)}
                  style={{ flex: 1, cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 'bold', minWidth: 40 }}>2024</span>
              </div>

              {/* Two charts side by side */}
              <div style={{ display: 'flex', gap: 30 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="plot4-chart-title">Global Energy Mix Breakdown</div>
                  <div className="plot4-chart-subtitle">Check the share of energy from each source in the year</div>
                  <P4_ResponsiveDonutChart data={yearlyData} height={CHART_HEIGHT} selectedYear={selectedYear} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="plot4-chart-title">Top 10 Countries with the Most Energy Use</div>
                  <div className="plot4-chart-subtitle">Total energy consumption in the year by country</div>
                  <P4_ResponsiveCountryBarChart data={countryData} height={CHART_HEIGHT} />
                </div>
              </div>

            </div>
          </div>

          <div className="plot4-footnote">
            Data source: OurWorldinData.org/energy (extract, 1965-2024)
          </div>

      </div>
    </>
  );
}

export default Plot4;