import { useEffect, useState } from "react";
import sunnyVideo from "./video/sunny.mp4";
import cloudVideo from "./video/cloud.mp4";
import rainVideo from "./video/rain.mp4";
import snowVideo from "./video/snow.mp4";
import thunderstormVideo from "./video/thunderstorm.mp4";
import "./Home.css"

function Home() {

    const [weatherData, setWeatherData] = useState(null);
    const [id, setId] = useState("");

    
    function getWeatherCategory(code) {
        if (code === 800) return sunnyVideo;
        if ((code >= 200 && code < 600) || (code >= 700 && code <= 781)) return rainVideo;
        if (code >= 801 && code <= 804) return cloudVideo;
        if (code >= 600 && code < 700) return snowVideo;
        if (code === 771 || code === 781) return thunderstormVideo;
    }

    useEffect(() => {

        fetch('http://localhost:8000/api/weather/')
        .then(response => response.json())
        .then(data => {
            setWeatherData(data);
        }).catch(error => {
            console.error("API　エラー:", error);
        });
    }, []);

    useEffect(() => {
    if (weatherData) {
        setId(getWeatherCategory(weatherData.id));
        console.log("動画src:", getWeatherCategory(weatherData.id));
    }
    }, [weatherData]);
    
    if (!weatherData) {
        return <div>読み込み中...</div>
    }

    return (
        <>
        <video autoPlay loop muted playsInline className="background-video">
        <source src={id} type="video/mp4"/>
        </video>
        <h2 className="location">{weatherData.city}の天気</h2>
        <div className="Weather_data">
        <p>気温: {weatherData.temperature}°C</p>
        <p>天気: {weatherData.condition}</p>
        <p>風速: {weatherData.wind}</p>
        </div>

        </>
    )

    }

export default Home
    