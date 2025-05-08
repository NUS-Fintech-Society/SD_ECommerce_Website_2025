import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeListings, { Listing } from "./HomeListings";
import "../Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  const [listings, setListings] = useState<Listing[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleItemClick = (event: React.MouseEvent) => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-300">
      {/* Top navigation bar */}
      <div className="w-full bg-white shadow-md py-4 px-6 fixed top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo on the left */}
          <div
            className="text-xl font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            Landing Page Logo
          </div>

          {/* Login and Signup buttons on the right */}
          <div className="space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-24 px-4 flex-grow">
        <HomeListings />
      </div>
    </div>
  );
};

export default Landing;
