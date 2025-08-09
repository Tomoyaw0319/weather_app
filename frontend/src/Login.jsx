import { useState } from "react";
import "./Login.css"
import { useNavigate } from "react-router-dom";


function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    
        e.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:8000/api/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, password}),
            });
            
            const data = await response.json();

            if(response.ok) {
                setSuccess(true);
                setError("")
                console.log("ログイン成功:", data)
                navigate("/home")
            }
            else {
                setSuccess(false)
                setError(data.message || "ログインに失敗しました");
            }
        } catch (error){
            setError("通信エラーが発生しました");
        }
    };

    return (
        <form id="LoginComponent" onSubmit={handleLogin}>
            <h1 className="logintext">ログイン</h1>

            <input 
                className="Loginput" 
                type="email" 
                placeholder="メールアドレス" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required/><br />

            <input 
                className="Loginput" 
                type="password" 
                placeholder="パスワード" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required/><br />

            <button
                className="loginButton"
                type="submit"
                value="ログイン">ログイン</button>

            <p className="logintext">または</p><br />
            <button className="signin" onClick={() => navigate("/signin")}>新規登録</button><br />
            
        </form>
    );    
}

export default Login