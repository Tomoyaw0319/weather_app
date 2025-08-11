// RegisterForm.jsx
import "./Signin.css"
import { useState } from "react";
import errorIcon from "./image/ErrorImg.png"
import { useNavigate } from "react-router-dom";


function Signin() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [success, setSuccess] = useState();
    const [errorMsg, setErrorMsg] = useState({username: "", email: "", password: "", password2: ""});

    const navigate = useNavigate();

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
                password2
            }),
        });

        const data = await response.json();

        if (response.ok) {
            setSuccess(true);
            setUsername("");
            setEmail("");
            setPassword("");
            setErrorMsg({ username: "", email: "", password: "", password2: ""});
            alert("作成できました")
            navigate("/login")
        } else {
            setErrorMsg(data.errors || {});
        }
    };

    return (
        <>
        <form onSubmit={handleSubmit} id="SigninComponent">
            <h1 className="SigninTitle">ユーザー登録</h1>
        <div className="InputWrapper">
            <input
                className="Signinput"
                type="text"
                placeholder="ユーザー名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            {errorMsg.username && 
                <div className="Error">
                    <img src={errorIcon} className="ErrorImg"/>
                    <p className="ErrorMsg">{errorMsg.username}</p>
                </div>
            }
        </div>
        <div className="InputWrapper"> 
            <input
                className="Signinput"
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            {errorMsg.email && 
                    <div className="Error">
                    <img src={errorIcon} className="ErrorImg"/>
                    <p className="ErrorMsg">{errorMsg.email}</p>
                </div>
            }
        </div>
        <div className="InputWrapper">
            <input
                className="Signinput"
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {errorMsg.password && 
                    <div className="Error"> 
                    <img src={errorIcon} className="ErrorImg"/>
                    <p className="ErrorMsg">{errorMsg.password}</p>
                </div>
            }
        </div>
        <div className="InputWrapper">
            <input
                className="Signinput"
                type="password"
                placeholder="パスワード(確認用)"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
            /> 
            {errorMsg.password2 && 
                    <div className="Error"> 
                    <img src={errorIcon} className="ErrorImg"/>
                    <p className="ErrorMsg">{errorMsg.password2}</p>
                </div>
            }
        </div>
            <button className="SigninButton" type="submit">登録</button>
        </form>

        {success && <p style={{color: "blue"}}>作成できました</p>}

        </>
    );
}

export default Signin;
