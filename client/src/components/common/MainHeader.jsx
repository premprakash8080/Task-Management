import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MainHeader() {
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-green-600">TaskMaster</Link>
        <div>
          <button
            className={`px-4 py-2 mr-4 ${activeButton === "signup" ? "active-button" : "text-gray-700"}`}
            onClick={() => {
              setActiveButton("signup");
              navigate("/signup");
            }}
          >
            Sign Up
          </button>
          <button
            className={`px-4 py-2 ${activeButton === "login" ? "active-button" : "text-gray-700"}`}
            onClick={() => {
              setActiveButton("login");
              navigate("/login");
            }}
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}