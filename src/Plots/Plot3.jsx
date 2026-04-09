import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

function Plot3() {
  const svgRef = useRef()

  useEffect(() => {
    
    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 30, bottom: 30, left: 40},    
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // use the svg ref from the component
    const svg = d3.select(svgRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              `translate(${margin.left},${margin.top})`);



    // get the data
    // alternative, You could also write it with modern async/await syntax:
    //const data = await d3.csv("URL");
    // get the data
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_doubleHist.csv").then( function(data) {
    
      // X axis: scale and draw:
      const x = d3.scaleLinear()
          .domain([-4,9])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
          .range([0, width]);
      svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x));
    
      // set the parameters for the histogram
      const histogram = d3.histogram()
          .value(function(d) { return +d.value; })   // I need to give the vector of value
          .domain(x.domain())  // then the domain of the graphic
          .thresholds(x.ticks(40)); // then the numbers of bins
    
      // And apply twice this function to data to get the bins.
      const bins1 = histogram(data.filter( function(d){return d.type === "variable 1"} ));
      const bins2 = histogram(data.filter( function(d){return d.type === "variable 2"} ));
    
      // Y axis: scale and draw:
      const y = d3.scaleLinear()
          .range([height, 0]);
          y.domain([0, d3.max(bins1, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
      svg.append("g")
          .call(d3.axisLeft(y));
    
      // append the bars for series 1
      svg.selectAll("rect")
          .data(bins1)
          .join("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return `translate(${x(d.x0)} , ${y(d.length)})`})
            .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#69b3a2")
            .style("opacity", 0.6)
    
      // append the bars for series 2
      svg.selectAll("rect2")
          .data(bins2)
          .enter()
          .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return `translate(${x(d.x0)}, ${y(d.length)})`})
            .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#404080")
            .style("opacity", 0.6)
    
      // Handmade legend
      svg.append("circle").attr("cx",300).attr("cy",30).attr("r", 6).style("fill", "#69b3a2")
      svg.append("circle").attr("cx",300).attr("cy",60).attr("r", 6).style("fill", "#404080")
      svg.append("text").attr("x", 320).attr("y", 30).text("variable A").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 320).attr("y", 60).text("variable B").style("font-size", "15px").attr("alignment-baseline","middle")
    
    })
  }, [])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
      <div style={{ marginLeft: '80px' }}>
        <h1 style={{ marginLeft: '20px' }}>Histogram</h1>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default Plot3;
