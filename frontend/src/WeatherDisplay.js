import { useEffect, useState } from "react";

function WeatherDisplay() {

    const [weatherData, setWeatherData] = useState(null);

    useEffect(() => {

        fetch('http://localhost:8000/api/weather/')
        .then(response => response.json())
        .then(data => {
            setWeatherData(data);
        }).catch(error => {
            console.error("API　エラー:", error);
        });
    }, []);
    
    if (!weatherData) {
        return <div>読み込み中...</div>
    }

    return (
        <>
        <h2>{weatherData.city}の天気</h2>
        <p>気温: {weatherData.temperature}</p>
        <p>天気: {weatherData.condition}</p>
        <p>風速: {weatherData.wind}</p>
        </>
    )

    }

export default WeatherDisplay
    