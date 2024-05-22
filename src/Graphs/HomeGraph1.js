import * as d3 from 'd3-v4' // Import D3
import {useEffect, useRef} from 'react'
import './HomeGraph1.css'

const HomeGraph1 = ({movies, barClicked}) => {

    const d3Container = useRef();
    const data = movies;
    
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    
    useEffect(() => {

		// append the svg object to the body of the page
        const svg = d3.select(d3Container.current)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 600 400")
        .classed("hist-svg", true);
        //.attr("transform", `translate(${margin.left},${margin.top})`);

         var x = d3.scaleLinear()
            .domain([2, 10])
            .range([40, width - margin.right]);

         svg.append("g")
           .attr("class", "axis")
            .attr("transform", "translate(0," + (height - margin.bottom + 20) + ")")
            .call(d3.axisBottom(x))
            .append("text")
            .attr("x", width/2+5)
            .attr("y", margin.bottom/2+5)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .text("IMDB Score");

        
        var y = d3.scaleLinear()
        .domain([0, 120])
        .range([height - margin.bottom + 20, margin.top + 20]);
        
        svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 40 + ",0)")
        .attr("x", width/2)
        .call(d3.axisLeft(y));

        var score = data.map(d => d["IMDB.Score"])
        var bins = d3.histogram().domain(x.domain()).thresholds(20)(score);
        var tooltip = d3.select("#hist").append("div").attr("class", "tooltip");
console.log(bins)
        svg.insert("g", "*")
            .attr("fill", "#69b3a2")
            .selectAll("rect")
            .data(bins)
            .enter().append("rect")
            .attr("x", function(d) { return x(d.x0) + 1; })
            //.attr("y", function(d) { return y(d.length); })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
            //.attr("height", function(d) { return y(0) - y(d.length); })
            .attr("height", 0)
            .attr("y", function(d) { return y(0); })
            
            .on("mouseover", function(d){
                d3.select(this).style("fill", "#66ffd9")
                .style("cursor", "pointer");
                var half = d.x0 + 0.5;
                tooltip
                    .html("Score: " +  d.x0.toFixed(1) + "-" + half.toFixed(1) + "<br>" + "Amount: " + d.length)
                    .style("opacity", 1)
            })

            .on("mousemove", function(d) {
                tooltip.style("transform","translateY(-150%)")
                        .style("left", d3.event.pageX/2 + "px")
                        .style("top", d3.event.pageY/2 + "px")
                        //.style("display", "inline-block")
            })
    
            .on("mouseout", function(d) {
                d3.select(this).style("fill", "#69b3a2");
                tooltip.style("opacity", 0)
            })
            
            .on('click', function(d,i){ 
                barClicked(d.x0, d.x1)
            });

        // Animation
        svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", function(d) { return y(d.length); })
        .attr("height", function(d) { return y(0) - y(d.length); })
        .delay(function(d,i){console.log(i) ; return(i*100)})


        //Add title
	    svg.append("text")
        .attr("x", width/2+5)             
        .attr("y", 30)
        .attr("text-anchor", "middle")  
        .style("font-size", "18px")  
        .text("Frequency of Netflix Movies's Scores");

        //Add explanation
        svg.append("text")
        .attr("x", 10)             
        .attr("y", height)
        .style("font-size", "10px")  
        .text("*You can press the Bars");

    }, [movies])
    
    return ( 
        <div id = 'hist' className = "hist-plot">
            <svg ref = { d3Container }></svg>
        </div>
     );
}
 
export default HomeGraph1;