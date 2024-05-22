import * as d3 from 'd3-v4' // Import D3
import {useEffect, useRef} from 'react'
import './Boxplot.css'

const Boxplot = ({movies}) => {

    const d3Container = useRef();
    const data = movies;

    // set the dimensions and margins of the graph
    const margin = {top: 80, right: 70, bottom: 70, left: 120},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    const padding = 40;

    useEffect(() => {

        // append the svg object to the body of the page
        const svg = d3.select(d3Container.current)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 600 300")
        .classed("svg-content", true);
        
        //Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
        var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
            .key(function(d) { return d.Genre;})
            .rollup(function(d) {
                var q1 = d3.quantile(d.map(function(g) { return g["IMDB.Score"];}).sort(d3.ascending),0.25)
                var median = d3.quantile(d.map(function(g) { return g["IMDB.Score"];}).sort(d3.ascending),0.5)
                var q3 = d3.quantile(d.map(function(g) { return g["IMDB.Score"];}).sort(d3.ascending),0.75)
                var interQuantileRange = q3 - q1
                var min = d3.min(d.map(function(g) { return g["IMDB.Score"]; }))
                //q1 - 1.5 * interQuantileRange
                var max = d3.max(d.map(function(g) { return g["IMDB.Score"]; }))
                //q3 + 1.5 * interQuantileRange
                return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
            })
            .entries(data)
       
        //when the year changes - first remove all the elements and then add them again
        svg.selectAll(".axis").remove();
        svg.selectAll(".boxes").remove();
        svg.selectAll(".verLines").remove();
        svg.selectAll(".medianLines").remove();


        // Show the X scale
        var x = d3.scaleBand()
        .range([padding, width+4*padding])
        .domain(data.map(c => c.Genre).sort())
        .paddingInner(1)
        .paddingOuter(.5)

        svg.append("g")
        .attr("class", "axis")  
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

        // Show the Y scale
        var y = d3.scaleLinear()
        .domain([2,9])
        .range([height - padding, padding])

        svg.append("g")
            .attr("class", "axis")  
            .call(d3.axisLeft(y))
            .attr("transform", "translate(" + padding + ",0)");

        var textFormat = d3.format(",.1f");
        
        // Show the main vertical line
        svg.selectAll("verLines")
        .data(sumstat)
        .enter()
        .append("line")
            .attr("class", "verLines")
            .attr("x1", function(d){return(x(d.key))})
            .attr("x2", function(d){return(x(d.key))})
            .attr("y1", function(d){return(y(d.value.min))})
            .attr("y2", function(d){return(y(d.value.max))})
            .attr("stroke", "black")
            .style("width", 40)

        var tooltip = d3.select('#box').append("div").attr("class", "tooltip")

        // rectangle for the main box
        var boxWidth = 30
        svg.selectAll("boxes")
            .data(sumstat)
            .enter()
            .append("rect")
                .attr("class", "boxes")
                .attr("x", function(d){return(x(d.key)-boxWidth/2)})
                .attr("y", function(d){return(y(d.value.q3))})
                .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))})
                .attr("width", boxWidth )
                .attr("stroke", "black")
                .style("fill", "#9D79BC")
            
            
            //Decide what happens when our mouse will move on one of the boxes 
            .on('mouseover', function (d) {
                //Change the box's color
                d3.select(this).style("fill", "#EDA1F8");
                //Make the tooltip visable and with the box's data
                tooltip
                .html( "<span style='font-weight:bold; text-decoration:underline'>" + d.key + "</span>" 
                        + "<br>" + "Max: " + textFormat(d.value.max) + "<br>"
                        + "Q3: " + textFormat(d.value.q3) + "<br>" + "Mdeian: " + textFormat(d.value.median) + "<br>"
                        + "Q1: " + textFormat(d.value.q1) + "<br>" + "Min: " + textFormat(d.value.min))
                //.style("transform","translateX(+255%)")
                // .style("left", d3.select(this).attr("cx") + "px")     
                // .style("top", d3.select(this).attr("cy") + "px")
                .style("opacity", 1);
            })

            .on("mousemove", function(d) {
                console.log(d3.event.pageX)
                if (d3.event.pageX > 760) {
                    tooltip.style("transform","translateY(-55%)")
                        .style("left", d3.event.pageX-80 + "px")
                        .style("top", d3.event.pageY/2 - 70 + "px")
                }
                else {
                    tooltip.style("transform","translateY(-55%)")
                        .style("left", d3.event.pageX-50 + "px")
                        .style("top", d3.event.pageY/2 - 70 + "px")
                        //.style("display", "inline-block")
                }
            })

            //Decide what happens when our mouse get off one of the boxes
            .on('mouseout', function (d) {
                    //Change the box's color back to it's original one
                    d3.select(this).style("fill", "#9D79BC");
                    //Make the tooltip invisable again
                    tooltip.style("opacity", 0)
            });

        // Show the median
        svg.selectAll("medianLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("class", "medianLines")
            .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
            .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
            .attr("y1", function(d){return(y(d.value.median))})
            .attr("y2", function(d){return(y(d.value.median))})
            .attr("stroke", "black")
            .style("width", 80)
            //Decide what happens when our mouse will move on one of the boxes 
            .on('mouseover', function (d) {
                //Change the box's color
                d3.select(this).style("fill", "#66ffd9");
                //Make the tooltip visable and with the box's data
                tooltip
                .html( "<span style='font-weight:bold; text-decoration:underline'>" + d.key + "</span>" 
                        + "<br>" + "Max: " + textFormat(d.value.max) + "<br>"
                        + "Q3: " + textFormat(d.value.q3) + "<br>" + "Mdeian: " + textFormat(d.value.median) + "<br>"
                        + "Q1: " + textFormat(d.value.q1) + "<br>" + "Min: " + textFormat(d.value.min))
                //.style("transform","translateX(+255%)")
                // .style("left", d3.select(this).attr("cx") + "px")     
                // .style("top", d3.select(this).attr("cy") + "px")
                .style("opacity", 1);
            })

            .on("mousemove", function(d) {
                if (d3.event.pageX > 760) {
                    tooltip.style("transform","translateY(-55%)")
                        .style("left", d3.event.pageX-80 + "px")
                        .style("top", d3.event.pageY/2 - 70 + "px")
                }
                else {
                    tooltip.style("transform","translateY(-55%)")
                        .style("left", d3.event.pageX-50 + "px")
                        .style("top", d3.event.pageY/2 - 70 + "px")
                        //.style("display", "inline-block")
                }
            })

            //Decide what happens when our mouse get off one of the boxes
            .on('mouseout', function (d) {
                    //Change the box's color back to it's original one
                    d3.select(this).style("fill", "#9D79BC");
                    //Make the tooltip invisable again
                    tooltip.style("opacity", 0)
            });

        //Add title
	    svg.append("text")
        .attr("class", "title")
        .attr("x", (width-3*padding))             
        .attr("y", padding/2)
        .attr("text-anchor", "middle")  
        // .style("font-size", "15px") 
        // .style("font-weight", "bold") 
        .text("Score by Genre");

        //Add x label
		svg.append("text")
        .attr("x", width+185)
        .attr("y", height-20)
        .attr("text-anchor", "end")
        .attr("class", "label")
        .text("Genre")
        .style("font-size", "10px");
      
        //Add y label
        svg.append("text")
            .attr("x", 10)
            .attr("y", 25)
            //.attr("transform","translate(-270,350) rotate(-90)")
            .attr("class", "label")
            .text("IMDB Score")
            .style("font-size", "10px");

    }, [movies])
    
    
    
    
    return(
        <div id = 'box' className="box-plot">
            <svg ref = { d3Container }></svg>
        </div>
    );
}
 
export default Boxplot;