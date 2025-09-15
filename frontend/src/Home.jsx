import { useEffect, useState } from "react";
import sunnyVideo from "./video/sunny.mp4";
import cloudVideo from "./video/cloud.mp4";
import rainVideo from "./video/rain.mp4";
import snowVideo from "./video/snow.mp4";
import thunderstormVideo from "./video/thunderstorm.mp4";
import { useNavigate } from "react-router-dom";
import "./Home.css"

function Home() {
    const [weatherData, setWeatherData] = useState(null);
    const [id, setId] = useState("");
    const [city, setCity] = useState("");
    const navigate = useNavigate();

    const fetchWeather = async (e) => {
        e.preventDefault();
        console.log("fetchWeatherが呼ばれました。city:", city);

        try {
            const response = await fetch(`http://localhost:8000/api/weather?city=${city}`);
            const data = await response.json();
            console.log("APIからのデータ:", data);
            setWeatherData(data);
        } catch (error) {
            console.error("API エラー:", error);
        }
    };

    function getWeatherCategory(code) {
        if (code === 800) return sunnyVideo;
        if (code >= 200 && code < 600) return rainVideo;
        if (code >= 600 && code < 700) return snowVideo;
        if (code >= 801 && code <= 804) return cloudVideo;
        if (code === 771 || code === 781) return thunderstormVideo;
        return sunnyVideo; 
    }

    useEffect(() => {
        fetch("http://localhost:8000/api/weather/")
            .then((response) => response.json())
            .then((data) => {
                setWeatherData(data);
            })
            .catch((error) => {
                console.error("API エラー:", error);
            });
    }, []);

    useEffect(() => {
        if (weatherData) {
            const video = getWeatherCategory(weatherData.id);
            console.log("getWeatherCategoryで取得した動画:", video);
            setId(video);
        }
    }, [weatherData]);

    if (!weatherData) {
        return <div>読み込み中...</div>;
    }

    const handleLogout = async () => {
    try {
        const response = await fetch("http://localhost:8000/api/logout/", {
            method: "POST",
            credentials: "include",
        });

        if (response.ok) {
            alert("ログアウトしました");
            navigate("/");
        } else {
            alert("ログアウトに失敗しました");
        }
    } catch (error) {
        console.error("ログアウトエラー:", error);
    }
};


    return (
        <>
            { id && (
            <video
            key={id}
            autoPlay
            loop
            muted
            playsInline
            className="background-video"
        >
            <source src={id} type="video/mp4" />
        </video>
        )}
            <h2 className="location">{weatherData.city}の天気</h2>
            <div className="Weather_data">
                <p><strong>気温:</strong> {weatherData.temperature}°C</p>
                <p><strong>天気:</strong> {weatherData.condition}</p>
                <p><strong>風速:</strong> {weatherData.wind}</p>
            </div>

            <form className="locateInput" onSubmit={fetchWeather}>
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="都市名"
                />
                <button type="submit">検索</button>
            </form>

        <button className="logout-button" onClick={handleLogout}>ログアウト</button>

        </>
    );
}

export default Home;
