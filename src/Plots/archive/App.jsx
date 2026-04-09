import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

function App() {
  const svgRef = useRef()

  useEffect(() => {
    const data = [25, 60, 45, 80, 35, 90, 50]
    const labels = data.map((_, i) => String.fromCharCode(65 + i)) // ['A','B',...,'G']

    const width = 800
    const height = 300
    const margin = { top: 20, right: 20, bottom: 30, left: 30 }


    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    const x = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([margin.left, width - margin.right])

    const y = d3.scaleBand()
      //.domain(data.map((_, i) => i))
      .domain(labels)
      .range([margin.top, height - margin.bottom])
      .padding(0.2)

    svg.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', margin.left)
      .attr('y', (_, i) => y(labels[i])) // position by label
      .attr('width', d => x(d) - margin.left)  //x(d): This gives the pixel position on the x-axis for the right edge of the rectangle corresponding to the data value
      .attr('height', y.bandwidth())
      .attr('fill', 'steelblue')

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
  }, [])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
      <div style={{ marginLeft: '80px' }}>
        <h1 style={{ marginLeft: '20px' }}>D3 Bar Chart</h1>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default App
