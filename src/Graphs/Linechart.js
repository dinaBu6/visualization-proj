import * as d3 from 'd3-v4' // Import D3
import {useEffect, useRef, useState} from 'react'
import './Linechart.css'

const Linechart = ({movies, year}) => {

    const d3Container = useRef();

    const w = 600;
    const h = 300;
    const padding = 40;
    const colors = d3.scaleOrdinal(d3.schemeCategory10);
    const  padTo2Digits = (num) => {
        return num.toString().padStart(2, '0');
    }
    const  formatDate = (date) => {
        return [
          padTo2Digits(date.getDate()),
          padTo2Digits(date.getMonth() + 1),
          date.getFullYear(),
        ].join('/');
      }

    useEffect(() => {
        //Create SVG element
        const svg = d3.select(d3Container.current)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 600 300")
                .classed("svg-content", true);


        if (year === "all") {
            var x = d3.scaleTime()
                .domain([
                    d3.min(movies, function(d) {return d.Premiere;}),
                    d3.max(movies, function(d) {return d.Premiere;})
                  ])
                .range([padding, w - padding]);
            var xAxis =  d3.axisBottom()
                .scale(x)
                .ticks(d3.timeFormat.year)
                .tickFormat(d3.timeFormat("%Y"));
        }
        else {
            var x = d3.scaleTime()
                .domain([new Date(year, 0, 1), new Date(year, 11, 31)])
                .range([padding, w - padding]);

            const val = [new Date(year, 1, 1), new Date(year, 3, 1), new Date(year, 5, 1), new Date(year, 7, 1), new Date(year, 9, 1), new Date(year, 11, 1)]
          //Define X axis
            var xAxis =  d3.axisBottom()
              .scale(x)
              .ticks(d3.timeFormat.months)
              .tickValues(val)
              .tickFormat(d3.timeFormat("%B"));

        }
        
        var y = d3.scaleLinear()
                .domain([0, 10])
                .range([h - padding, padding]);
        
        //Define Y axis
        var yAxis = d3.axisLeft()
                .scale(y);
            
        // This allows to find the closest X index of the mouse:
        var bisect = d3.bisector(function(d) { return d.Premiere; }).left;
                        
        //Adding the line 
		var scoreLine = d3.line()
                .x(function(d) { return x(d.Premiere);})
                .y(function(d) { return y(d["IMDB.Score"]);})
                .curve(d3.curveMonotoneX);

        svg.selectAll(".line").remove();
        // Add the line
            svg
            .append("path")
            .datum(movies)
            .attr("class", "line")
            .attr("d", scoreLine);


        // // Create the circle that travels along the curve of chart
        // var focus = svg
        // .append('g')
        // .append('circle')
        //     .style("fill", "none")
        //     .attr("stroke", "black")
        //     .attr('r', 5)
        //     .style("opacity", 0)

        // // Create the text that travels along the curve of chart
        // var focusText = svg
        // .append('g')
        // .append('text')
        //     .style("opacity", 0)
        //     .attr("text-anchor", "left")
        //     .attr("alignment-baseline", "middle")
        //     .attr("class", "toolText")

        var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

        focus.append("circle")
            .attr("r", 4)
            .attr("stroke", "red")
            .attr("fill", "none");

        focus.append("rect")
            .attr("class", "tooltipRect")
            .attr("width", 100)
            .attr("height", 50)
            .attr("y", -70)
            .attr("rx", 4)
            .attr("ry", 4);

        focus.append("text")
            .attr("class", "tooltip-date")
            .attr("y", -50);

        focus.append("text")
            .attr("class", "tooltip-label")
            .attr("y", -30)
            .text("Score:");

        focus.append("text")
            .attr("class", "tooltip-score")
            .attr("y", -30);

        // Create a rect on top of the svg area: this rectangle recovers mouse position
        svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', w)
        .attr('height', h)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", function(event, d) {
            if (d3.mouse(this)[0] > 500) {
                focus.select(".tooltipRect")
                    .attr("x", -60)

                focus.select(".tooltip-date")
                    .attr("x", -45)

                focus.select(".tooltip-label")
                    .attr("x", -45)

                focus.select(".tooltip-score")
                    .attr("x", 0)
            }
            else {
                focus.select(".tooltipRect")
                    .attr("x", 0)

                focus.select(".tooltip-date")
                    .attr("x", 16)

                focus.select(".tooltip-label")
                    .attr("x", 16)

                focus.select(".tooltip-score")
                    .attr("x", 60)

            }
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisect(movies, x0, 1),
                d0 = movies[i - 1],
                d1 = movies[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            focus.attr("transform", "translate(" + x(d.Premiere) + "," + y(d["IMDB.Score"]) + ")");
            focus.select(".tooltip-date").text(formatDate(d.Premiere));
            focus.select(".tooltip-score").text((d["IMDB.Score"]));
        });

        svg.selectAll(".axis").remove();
        //Create X axis
		svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(xAxis);

        		
		//Create Y axis
         svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);

        //Add x label
		svg.append("text")
        .attr("x", w-2)
        .attr("y", h - padding/8)
        .attr("text-anchor", "end")
        .attr("class", "label")
        .text("Premiere date")
        .style("font-size", "10px");
      
        //Add y label
        svg.append("text")
            .attr("x", 3)
            .attr("y", 30)
            //.attr("transform","translate(-270,350) rotate(-90)")
            .attr("class", "label")
            .text("IMDB Score")
            .style("font-size", "10px");


        //Add title
        svg.append("text")
            .attr("class", "title")
            .attr("x", (w / 2))             
            .attr("y", padding/2)
            .attr("text-anchor", "middle")   
            .text("Score across Premiere Time");



    },[movies, year])

    return ( 
        <div className="line-chart">
            <svg ref = { d3Container }></svg>
        </div>
    );
}
 
export default Linechart;