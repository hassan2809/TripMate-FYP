import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-black p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-white text-2xl font-bold">Tripmate</div>

        {/* Hamburger Icon */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>

        {/* Navbar Links for large screens */}
        <div className="hidden md:flex space-x-6">
          <a href="#" className="text-white px-4 py-2 hover:bg-blue-500 rounded">Home</a>
          <a href="#" className="text-white px-4 py-2 hover:bg-blue-500 rounded">About</a>
          <a href="#" className="text-white px-4 py-2 hover:bg-blue-500 rounded">Services</a>
          <a href="#" className="text-white px-4 py-2 hover:bg-blue-500 rounded">Contact</a>
        </div>

        <div className="hidden md:flex space-x-6">
          <a href="#" className="text-white px-4 py-2 hover:bg-blue-500 rounded">Login</a>
          <a href="#" className="text-white px-4 py-2 hover:bg-blue-500 rounded">Sign Up</a>
        </div>
      </div>

      {/* Full-Screen Overlay Menu for Small Screens */}
      {isOpen && (
        <div className="fixed inset-0 bg-black flex flex-col justify-start items-center md:hidden z-50">
          <div className="w-full flex justify-between items-center p-4">
            <div className="text-white text-2xl font-bold">Tripmate</div>
            <button onClick={toggleMenu} className="text-white focus:outline-none">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Menu Links */}
          {/* <ul className="te space-y-4 mt-8"> */}
          {/* <ul className="flex flex-col items-start space-y-4 mt-8 w-full pl-4">
            <li>
              <a href="#" className="text-white text-xl hover:text-gray-200">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-white text-xl hover:text-gray-200">
                About
              </a>
            </li>
            <li>
              <a href="#" className="text-white text-xl hover:text-gray-200">
                Services
              </a>
            </li>
            <li>
              <a href="#" className="text-white text-xl hover:text-gray-200">
                Contact
              </a>
            </li>
          </ul> */}
          {/* Menu Links */}
          <ul className="flex flex-col items-start space-y-4 mt-8 w-full pl-4">
            <li>
              <a href="#" className="text-white text-xl hover:text-gray-200">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-white text-xl hover:text-gray-200">
                About
              </a>
            </li>
            <li>
              <a href="#" className="text-white text-xl hover:text-gray-200">
                Services
              </a>
            </li>
            <li>
              <a href="#" className="text-white text-xl hover:text-gray-200">
                Contact
              </a>
            </li>

            {/* Login and Sign Up Links */}

            <li>
              <a href="#" className="text-white text-xl hover:text-gray-200">
                Login
              </a>
            </li>
            <li>
              <a href="#" className="text-white text-xl hover:text-gray-200">
                Sign Up
              </a>
            </li>
          </ul>


        </div>
      )}
    </nav>
  );
};

export default Navbar;
