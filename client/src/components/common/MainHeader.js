import { useState } from "react";

export default function Header() {
  const [activeButton, setActiveButton] = useState(null);

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-green-600">TaskMaster</div>
        <div>
          <button
            className={`px-4 py-2 mr-4 ${activeButton === "signup" ? "active-button" : "text-gray-700"}`}
            onClick={() => setActiveButton("signup")}
          >
            Sign Up
          </button>
          <button
            className={`px-4 py-2 ${activeButton === "login" ? "active-button" : "text-gray-700"}`}
            onClick={() => setActiveButton("login")}
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}