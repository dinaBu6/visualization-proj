import * as d3 from 'd3' // Import D3
import { max } from 'd3';
import {useEffect, useRef} from 'react'
import './HomeGraph2.css'

const HomeGraph2 = ({movies}) => {

    const d3Container = useRef();
    
    const data = movies;

    // set the dimensions and margins of the graph
    const margin = {top: 80, right: 70, bottom: 70, left: 120},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    const padding = 65;

    useEffect(() => {

        //Create SVG element
        const svg = d3.select(d3Container.current)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 600 400")
                .classed("svg-content", true);

        // find all the unique language in our data
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        var gen = data.map(d => d.Genre);
        var uniqueGen = gen.filter(onlyUnique);

        //loop over the data to create avarage score for each language
        var dict = [];
        for (var i in uniqueGen) {
            var ourGen = data.filter(d => d.Genre == uniqueGen[i]);            
            let result = ourGen.map(d => d["IMDB.Score"]);
            var count = 0;
            result.forEach((num) => { count += 1 });
            //const average = sum / result.length;

            dict.push({
                Genre: uniqueGen [i],
                Count: count,
            });
        }
        //console.log(dict);
        
        dict.sort(function(x, y){
            return d3.descending(x.Count, y.Count);
         })

    	//Define, scale and add X axis
		const x = d3.scaleLinear()
                .domain([0, d3.max(dict, function(d) { return d.Count; })+1])
                .range([padding*1.5, width+2*padding]);
        
        svg.selectAll(".axis").remove();

        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisBottom(x))
            .attr("transform", `translate(0, ${height+30})`);
   
        //Define and scale Y axis
        const y = d3.scaleBand()
                .domain(dict.map(c => c.Genre))
                .range([30, height+30])
                .padding(0.1);
        
        var tooltip = d3.select("#barHome").append("div").attr("class", "tooltip");

        
        
        //Bars
        svg.selectAll(".bar")
        .data(dict)
        .join('rect')
        .attr("class", "bar")
        .attr("fill", "#69b3a2")
        .attr("y", function(d) { return y(d.Genre);})
        .attr("height", y.bandwidth())
        //.attr("x", x(0))
        //.attr("width", function(d) { return x(d.Count)-1.5*padding; })
        .attr("width", 0)
        .attr("x", function(d) { return padding*1.5; })

        
        .on("mouseover", function(event, d){
            d3.select(this).style("fill", "#66ffd9");
            tooltip
                .html("<strong> Genre: </strong>" + d.Genre + "<br>"
                         + "<strong> Amount: </strong>" + d.Count)
                .style("opacity", 1)
        })
        .on("mousemove", function(event, d) {
            tooltip//.style("transform","translateY(+150%)")
                   .style("left",(event.x)/2.5+ "px")
                   .style("top",(event.y)-height - margin.top/1.2   + "px")
        })
    	.on("mouseout", function(event, d) {
            d3.select(this).style("fill", "#69b3a2");
            tooltip.style("opacity", 0)
        });

        //Add Y axis
        svg.append("g")
        .attr("class", "axis")  
        .call(d3.axisLeft(y))
        .attr("transform", "translate(" + padding*1.5 + ",0)");

        // Animation
        svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("x", x(0))
        .attr("width", function(d) { return x(d.Count)-1.5*padding; })
        .delay(function(d,i){console.log(i) ; return(i*100)})

        // var minn = d3.min(data, function(d) { return d["IMDB.Score"]; })
        // var maxx = d3.max(data, function(d) { return d["IMDB.Score"]; })   
        // var string = "Number of films between Score " + minn + " and " + maxx + " by Genre"
        // console.log(string);

        //Add title
	    svg.append("text")
            .attr("x", width-padding-5)             
            .attr("y", 20)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px")
            //.style("font-weight", "bold") 
            
            .text("Number of films in a Score Range by Genre");

        //Add x label
		svg.append("text")
            .attr("x", width+180)
            .attr("y", height+55)
            .attr("text-anchor", "end")
            .attr("class", "label")
            .text("Amount in this Score Range")
            .style("font-size", "12px");
          
        //Add y label
        svg.append("text")
            .attr("x", 70)
            .attr("y", 20)
            //.attr("transform","translate(-270,350) rotate(-90)")
            .attr("class", "label")
            .text("Genre")
            .style("font-size", "12px");

    }, [movies])
    
    return ( 
        <div id = 'barHome' className = "home-bar-plot">
            <svg ref = { d3Container }></svg>
        </div>
     );
}
 
export default HomeGraph2;