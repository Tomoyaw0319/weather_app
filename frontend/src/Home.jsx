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
    const [suggestions, setSuggestions] = useState([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const navigate = useNavigate();

    const fetchWeather = async (e, cityName) => {
        if (e) e.preventDefault();
        const query = cityName ?? city;
        console.log("fetchWeatherが呼ばれました。city:", query);

        try {
            const response = await fetch(`https://weather-app-hxi5.onrender.com/api/weather?city=${encodeURIComponent(query)}`);
            const data = await response.json();
            console.log("APIからのデータ:", data);
            setWeatherData(data);
            setSuggestions([]);
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
        fetch("https://weather-app-hxi5.onrender.com/api/weather/")
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

    useEffect(() => {
        const q = city.trim();
        if (!q) {
            setSuggestions([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`https://weather-app-hxi5.onrender.com/api/city_suggestions/?q=${encodeURIComponent(q)}`);
                const data = await res.json();
                if (Array.isArray(data)) setSuggestions(data);
            } catch (e) {
                console.error("suggestions error:", e);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [city]);

    if (!weatherData) {
        return <div>読み込み中...</div>;
    }

    const handleLogout = async () => {
    try {
        const response = await fetch("https://weather-app-hxi5.onrender.com/api/logout/", {
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
        <div className="home">
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
        <div className="content">
            <h2 className="location">{weatherData.city}の天気</h2>
            <div className="Weather_data">
                <p><strong>気温:</strong> {weatherData.temperature}°C</p>
                <p><strong>天気:</strong> {weatherData.condition}</p>
                <p><strong>風速:</strong> {weatherData.wind}</p>
            </div>

            <div className="search-box">
            <form className="locateInput" onSubmit={fetchWeather}>
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="都市名"
                />
                <button type="submit" className="search-button">検索</button>
            </form>
            {isInputFocused && suggestions.length > 0 && (
                <ul className="suggestions">
                    {suggestions.map((s, i) => (
                        <li
                            key={i}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setCity(s.name);
                                setSuggestions([]);
                                fetchWeather(null, s.name);
                            }}
                        >
                            {s.label}
                        </li>
                    ))}
                </ul>
            )}
            </div>

        <button className="logout-button" onClick={handleLogout}>ログアウト</button>
        </div>
        </div>
    );
}

export default Home;
