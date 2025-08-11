import './App.css';
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Signin from "./Signin";
import LayoutAfterLogin from './LayoutAfterLogin';
import LayoutBeforeLogin from './LayoutBeforeLogin';

function AppContent() {
  const location = useLocation();

  const beforeLoginPaths = ["/", "/login", "/signin"];
  const isBeforeLogin = beforeLoginPaths.includes(location.pathname);

  return isBeforeLogin ? (
    <LayoutBeforeLogin>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
    </LayoutBeforeLogin>
  ) : (
    <LayoutAfterLogin>
      <Routes>
        <Route path="/home" element={<Home />} />
      </Routes>
    </LayoutAfterLogin>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
