import * as d3 from 'd3' // Import D3
import {useEffect, useRef} from 'react'
import './Barplot.css'

const Barplot = (movies) => {

    const d3Container = useRef();
    
    const data = movies.movies;

    // set the dimensions and margins of the graph
    const margin = {top: 80, right: 70, bottom: 70, left: 120},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    const padding = 65;

    useEffect(() => {
        //console.log(movies);

        //Create SVG element
        const svg = d3.select(d3Container.current)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 600 400")
                .classed("svg-content", true);

        // find all the unique language in our data
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
          }
        var lang = data.map(d => d.Language);
        var uniqueLang = lang.filter(onlyUnique);

        //loop over the data to create avarage score for each language
        var dict = [];
        for (var i in uniqueLang) {
            var ourLang = data.filter(d => d.Language == uniqueLang[i]);            
            let result = ourLang.map(d => d["IMDB.Score"]);
            var sum = 0;
            result.forEach((num) => { sum += num });
            const average = sum / result.length;

            dict.push({
                Language: uniqueLang[i],
                Score: average,
            });
        }
        //console.log(dict);
        
        dict.sort(function(x, y){
            return d3.descending(x.Score, y.Score);
         })

    	//Define, scale and add X axis
		const x = d3.scaleLinear()
                .domain([0, 7.5])
                .range([padding, width+2*padding]);

        svg.selectAll(".axis").remove();
        
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height+30})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end");
   
        //Define, scale and add Y axis
        const y = d3.scaleBand()
                .domain(dict.map(c => c.Language))
                .range([30, height+30])
                .padding(0.1);
        
        svg.append("g")
                .attr("class", "axis")  
                .call(d3.axisLeft(y))
                .attr("transform", "translate(" + padding + ",0)");
        
        var tooltip = d3.select("#bar").append("div").attr("class", "tooltip");
        
        //Bars
        svg.selectAll(".bar")
        .data(dict)
        .join('rect')
        .attr("class", "bar")
        .attr("x", x(0))
        .attr("y", function(d) { return y(d.Language);})
        .attr("width", function(d) { return x(d.Score)-padding; })
        .attr("height", y.bandwidth())
        .attr("fill", "#69b3a2")
        
        .on("mouseover", function(event, d){
            //const subgroupName = d3.select(this.parentNode).datum().key;
            //const subgroupValue = d.data[subgroupName];
            d3.select(this).style("fill", "#66ffd9");
            tooltip
                .html("Language: " + d.Language + "<br>" + "Score: " + d.Score.toFixed(4))
                .style("opacity", 1)
        })

        .on("mousemove", function(event, d) {
            tooltip.style("transform","translateY(-55%)")
                .style("left",(event.x)/2.3+"px")
                .style("top",(event.y)-height - margin.top -margin.bottom/2   + "px")
        })
    	.on("mouseout", function(event, d) {
            d3.select(this).style("fill", "#69b3a2");
            tooltip.style("opacity", 0)
        });

        // //Add title
	    svg.append("text")
            .attr("class", "title")
            .attr("x", width-1.5*padding)             
            .attr("y", 20)
            .attr("text-anchor", "middle")  
            // .style("font-size", "15px")
            // .style("font-weight", "bold")   
            .text("Average Score by Language");

        //Add x label
		svg.append("text")
            .attr("x", width+180)
            .attr("y", height+55)
            .attr("text-anchor", "end")
            .attr("class", "label")
            .text("Average IMDB Score")
            .style("font-size", "10px");
          
        //Add y label
        svg.append("text")
            .attr("x", 25)
            .attr("y", 20)
            //.attr("transform","translate(-270,350) rotate(-90)")
            .attr("class", "label")
            .text("Language")
            .style("font-size", "10px");


    }, [movies])

    return ( 
        <div id = 'bar' className="bar-plot">
            <svg ref = { d3Container }></svg>
        </div> 
    );
}
 
export default Barplot;