// RegisterForm.jsx
import "./Signin.css"
import { useState } from "react";

function Signin() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:8000/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            setSuccess(true);
            setUsername("");
            setEmail("");
            setPassword("");
        } else {
            alert("エラー:" + data.message);
        }
    };

    return (
        <>
        <form onSubmit={handleSubmit} id="SigninComponent">
            <h1 className="SigninTitle">ユーザー登録</h1>
            <input
                className="Signinput"
                type="text"
                placeholder="ユーザー名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            /><br />
            <input
                className="Signinput"
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            /><br />
            <input
                className="Signinput"
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            /><br />
            <button className="SigninButton" type="submit">登録</button>
        </form>

        {success && <p style={{color: "blue"}}>作成できました</p>}

        </>
    );
}

export default Signin;
