import './App.css';
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Signin from "./Signin";

function AppContent() {
  const location = useLocation();

  return (
    <div>
      {location.pathname === "/" && (
        <Link to="/login">
          <button className='LoginButton'>ログイン</button>
        </Link>
      )}

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
