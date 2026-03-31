import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const navigate = useNavigate();

  const fetchWeather = async (e, cityName) => {
    if (e) e.preventDefault();
    const query = cityName ?? city;
    console.log("fetchWeatherが呼ばれました。city:", query);

    try {
      const response = await fetch(
        `https://weather-app-hxi5.onrender.com/api/weather?city=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      console.log("APIからのデータ:", data);
      setWeatherData(data);
      setSuggestions([]);
    } catch (error) {
      console.error("API エラー:", error);
    }
  };

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
    const q = city.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://weather-app-hxi5.onrender.com/api/city_suggestions/?q=${encodeURIComponent(q)}`
        );
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
      <div className="content">
        <h2 className="location">{weatherData.city}の天気</h2>
        <div className="Weather_data">
          <p>
            <strong>気温:</strong> {weatherData.temperature}°C
          </p>
          <p>
            <strong>天気:</strong> {weatherData.condition}
          </p>
          <p>
            <strong>風速:</strong> {weatherData.wind}
          </p>
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
            <button type="submit" className="search-button">
              検索
            </button>
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

        <button className="logout-button" onClick={handleLogout}>
          ログアウト
        </button>
      </div>
    </div>
  );
}

export default Home;
