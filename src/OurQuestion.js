import {useEffect, useState} from 'react'
import * as d3 from 'd3';
import datacsv from './NetflixOriginals.csv';
import Scatterplot from './Graphs/Scatterplot';
import Barplot from './Graphs/Barplot';
import Boxplot from './Graphs/Boxplot';
import LineChart from './Graphs/Linechart';
import './OurQuestion.css';

const OurQuestion = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [year, setYear] = useState("all")
    const dateParser = d3.timeParse("%m/%d/%Y");

    const handleChange = (e) => {
        setYear(e.target.value);
        if (e.target.value === "all") {
            setFilteredData(data);
        }
        else {
            setFilteredData(data.filter(d => d.Premiere.getFullYear() == e.target.value));
        }
    } 

    const row = (d) => {
        d["Title"] = d["Title"];
        d["IMDB.Score"] = parseFloat(d["IMDB.Score"]);
		d.Runtime= parseInt(d["Runtime"]);
        d.Premiere = dateParser(d["Premiere"]);
		d.Genre = d["Genre"];
        d.Language = d["Language"]
        return d;
    };


    useEffect(() => {
        d3.csv(datacsv, row).then(data => {
            setData(data);
            setFilteredData(data);
        });
    }, []);
    //console.log(filteredData);
     
    return ( 
        <div className="our-question">
            <h2 className='header'>
                What affects the score?
            </h2>
        <div className="div-filter">
            <p className='filteredP'>Year:</p>
            <select className="filteredYear" value={year} onChange={handleChange}>
                <option value="all">show all</option>
                <option value="2015">2015</option>
                <option value="2016">2016</option>
                <option value="2017">2017</option>
                <option value="2018">2018</option>
                <option value="2019">2019</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
            </select>
            
        </div>
            <div id="pgraphs"></div> 
            <Scatterplot movies = { filteredData } maxTime = { d3.max(data, function(d) { return d.Runtime; }) }/>
            <LineChart movies = { filteredData } year = {year} />
            <Boxplot movies = { filteredData }/>
            <Barplot movies = { filteredData }/>
        </div>
     );
}
 
export default OurQuestion;