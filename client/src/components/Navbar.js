// src/components/Navbar.js
import React from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">My Boston Real Estate</div>
      <div className="navbar-links">
        <a href="#buy">Buy</a>
        <a href="#rent">Rent</a>
        <a href="#sell">Sell</a>
      </div>
    </nav>
  );
};

export default Navbar;

