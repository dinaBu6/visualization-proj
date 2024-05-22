import {useEffect, useState } from "react";
import * as d3 from 'd3';
import datacsv from './NetflixOriginals.csv';
import HomeGraph1 from './Graphs/HomeGraph1';
import HomeGraph2 from './Graphs/HomeGraph2';
import './Home.css';

const Home = () => {
    const [data, setData] = useState([]);
    const [text, setText] =  useState("text");
    const [filteredData, setFilteredData] = useState([]);
    
    const [movNum, setMovNum] = useState(584);
    const [lowScore, setLowScore] = useState(2.5);
    const [higScore, setHigScore] = useState(9.5);
    const [genNum, setGenNum] = useState(12);
    
    const dateParser = d3.timeParse("%m/%d/%Y");

    const handleBarClicked = (lower, upper) => {
        const filtDat = data.filter(d => (d["IMDB.Score"] >= lower && d["IMDB.Score"] < upper))
        setFilteredData(filtDat)
        setMovNum(filtDat.length)
        setLowScore(lower)
        setHigScore(upper)

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        var gen = filtDat.map(d => d.Genre);
        var uniqueGen = gen.filter(onlyUnique);           
        setGenNum(uniqueGen.length)
    }

    const resetClicked = () => {
        handleBarClicked(2.5, 9.5);
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
     
    return ( 
        <div className="home">
            
            <div className="intreText">
            <h2 className='headerHome'>
                Netflix's Original Films - What are their IMDB Scores?
            </h2>
                <p>
                Netflix is the world's leading streaming entertainment service with 222 million paid memberships in over 190 countries enjoying TV series, documentaries, feature films and mobile games across a wide variety of genres and languages. 
                <br />
                <br />
                On this website, you will see different visualizations exploring how different parameters affect the IMDB score that original Netflix movies got throughout the years 2014-2021. 
                Here you can see the distribution of IMDB scores and on the "Our Question" page you can see the effect of the parameters on the IMDB score.
                </p>
            </div>
            <div id="hgraphs">
                <div className="div-button">
                        <button className="resetBot" onClick={resetClicked}>Reset</button>         
                    </div>
                <div className="countDiv">
                    <h2 className='par'>
                            <br></br>
                            <br></br>
                            
                            We Have: <br></br>
                            <em>{movNum}  </em>  Movies <br></br>
                            with Scores between <br></br>
                            <em>{lowScore}  </em> 
                            to <em> {higScore}</em> <br></br>
                            from <em> {genNum}  </em> Genres.
                    </h2>
                </div>
                <HomeGraph1 movies = { data } barClicked = {handleBarClicked }/>
                <HomeGraph2 movies = { filteredData }/>
            </div>
                
        </div>
     );
}
 
export default Home;