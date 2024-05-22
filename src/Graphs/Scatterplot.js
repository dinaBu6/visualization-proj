import { type } from '@testing-library/user-event/dist/type';
import * as d3 from 'd3' // Import D3
import {useEffect, useRef, useState} from 'react'
import './Scatterplot.css'

const Scatterplot = ({movies, maxTime}) => {

    const [regCheck, setRegCheck] = useState(false)
    const d3Container = useRef();
    const data = movies;

    const w = 600;
    const h = 300;
    const padding = 40;
    //s = d3.scaleOrdinal(d3.schemeCategory10);
    const color = (d) => {
        // console.log(d)
        if (d === 'Documentary'){
            //console.log(d)
            return "#E20914";
        }
        if (d === 'Comedy'){
            return "#69B3A2";
        }
        if (d === 'Drama'){
            return "#9D79BC";
        }
        else{
            return "#173753";
        }
    }
    
    useEffect(() => {

        //All needed scaling functions
		//All needed scaling functions
		var x = d3.scaleLinear()
                .domain([0, maxTime])
                .range([padding, w - padding]);
   
        var y = d3.scaleLinear()
                .domain([0, 10])
                .range([h - padding, padding]);

        //Define X axis
		var xAxis =  d3.axisBottom()
            .scale(x);
                
        //Define Y axis
        var yAxis = d3.axisLeft()
            .scale(y);

        //Create SVG element
        const svg = d3.select(d3Container.current)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 600 300")
                .classed("svg-content", true);

        //Create and design a tooltip elemnt to use later on	 
        var tooltip = d3.select('#scatter')
            .append("div")
            .attr("class", "tooltip")

        //Create circles according to the scaled data locations (our scatter plot itself)
        svg.selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", function(d) {
                    return x(d.Runtime);
            })
            .attr("cy", function(d) {
                    return y(d["IMDB.Score"]);
            })
            .attr("r", 3)
            .attr("fill", function(d) { return color(d.Genre)})
            .attr("stroke", "black")
            .attr("stroke-width", "0.8px")
        
            //Decide what happens when our mouse will move on one of the circles 
            .on('mouseover', function (event, d) {
                //Change the circle's color
                //console.log(d3.select(this));
                d3.select(this).transition()
                        .duration(200)
                        .attr("fill", "#66ffd9")
                        .attr("r", 4.5);
                //Make the tooltip visable
                tooltip.transition().duration(200).style("opacity", 1);
                //Put the circle's data in the tooltip
                console.log(event.x);
                if (event.x > 500) {
                    tooltip.html("Title: " + d.Title + "<br>" +"Length: " + d.Runtime + " min." + "<br>" +
                        "Score: " + d["IMDB.Score"])						
                        .style("left", (event.x-200)+ "px")     
                        .style("top", (event.y-80) + "px")
                        .style("z-index", "1");
                }
                else {
                    tooltip.html("Title: " + d.Title + "<br>" +"Length: " + d.Runtime + " min." + "<br>" +
                    "Score: " + d["IMDB.Score"])						
                    .style("left", (event.x+10)+ "px")     
                    .style("top", (event.y-100) + "px")
                    .style("z-index", "1");
                }  
            })
            //Decide what happens when our mouse get off one of the circles
            .on('mouseout', function (event, d) {
                    //Change the circle's color back to it's original one
                    d3.select(this).transition()
                        .attr("fill", function(d) { return color(d.Genre)})
                        .attr("r", 3);
                    //Make the tooltip invisable again
                    tooltip.transition().duration(100).style("opacity", 0)
            });

        svg.selectAll(".axis").remove();
        //Create X axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h - padding ) + ")")
            .call(xAxis);
                
        //Create Y axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);

        //Add x label
        svg.append("text")
            .attr("x", w-5)
            .attr("y", h - padding/8)
            .attr("text-anchor", "end")
            .attr("class", "label")
            .text("Movie's length - Runtime")
            .style("font-size", "10px");
            
        //Add y label
        svg.append("text")
            .attr("x", 10)
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
            //.style("font-weight", "bold") 
            .text("Runtime VS IMDB.Score");

        var legendData = movies.map(d => d.Genre)
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        legendData.forEach((g, index) => {
            if (g != 'Documentary' && g != 'Comedy' && g != 'Drama') {
                legendData[index] = 'Other'
            }
        });
        legendData = legendData.filter(onlyUnique).sort();

        svg.selectAll(".legand").remove();
        //Add legend
        var legend = svg.append("g")  
                .attr("class", "legand")
                .selectAll("g")
                .data(legendData)
                .enter()
                .append("g")
                .attr("transform", function (d, i) {
                    return "translate(0," + i * 13 + ")";
                });

        legend.append("circle")
                .attr("cx", 508)
                .attr("cy", 12)
                .attr("r", 3)
                .attr("fill", function (d) {
                    return color(d);
                    });

        legend.append("text")
                .attr("x", 515)
                .attr("y", 16)
                .style("font-size", "12px")
                .text(function (d) {
                return d;
                });

        
        svg.selectAll(".legRect").remove();
        var recWidth = 55
        if (legendData.length < 4) {
            recWidth = 30
        }
        svg.append("rect").attr("x", 500).attr("y", 5).attr("class", "legRect").attr("width", 95).attr("height", recWidth).style("stroke", "black").style("fill", "none").style("stroke-width", "0.4px");
    
        // scatter
        //Regression line
        const leastSquaresequation = (XaxisData, Yaxisdata) => {
            var reduceAddition = (prev, cur) => prev + cur;

			//finding the mean of Xaxis and Yaxis data
			var xBar = XaxisData.reduce(reduceAddition,0) * 1.0 / XaxisData.length;
			var yBar = Yaxisdata.reduce(reduceAddition,0) * 1.0 / Yaxisdata.length;

			var SquareXX = XaxisData.map(function(d) { return Math.pow(d - xBar, 2); })
			  .reduce(reduceAddition, 0);
			
			var ssYY = Yaxisdata.map(function(d) { return Math.pow(d - yBar, 2); })
			  .reduce(reduceAddition, 0);
			  
			var MeanDiffXY = XaxisData.map(function(d, i) { return (d - xBar) * (Yaxisdata[i] - yBar); })
			  .reduce(reduceAddition, 0);
			  
			var slope = MeanDiffXY / SquareXX;
			var intercept = yBar - (xBar * slope);

			
			//returning regression function
			return function(x){
			  return x*slope+intercept
			}
        }
        
        var regression;
        var XaxisData = movies.map(d => d.Runtime);
        var YaxisData = movies.map(d => d["IMDB.Score"]);
        regression = leastSquaresequation(XaxisData,YaxisData);

        var newRunTime = XaxisData.concat([1, maxTime]);

        svg.selectAll(".regLine").remove();
        if(regCheck) {
            var line = d3.line()
                .x(function(d) { return x((d)); })
                .y(function(d) { return y(regression(d)); });


            svg.append("path")
                .datum(newRunTime)
                .attr("class", "regLine")
                .attr("d", line);
        }

    }, [movies, regCheck])

    const regClicked = (e) => {
        var checkBoxVal = e.target.checked
        setRegCheck(checkBoxVal)
    }
    
    return ( 
        <div id = 'scatter' className = "scatter-plot">
            <svg ref = { d3Container }></svg>
            <div className="checkDiv">
                <input className='regCheck' type="checkbox" value={regCheck} onChange={regClicked}/><label htmlFor="checkbox">Show Regression Line</label> 
            </div>
        </div>
     );
}
 
export default Scatterplot;