import React from 'react';
import './App.css';
import { Link } from 'react-router-dom';

export const Nav = (props) => (
  <nav>
    <h3>Logo</h3>
    <ul className="nav-links">
      <Link to="/">
        <li> Home </li>
      </Link>
      <Link to="/about">
        <li> About </li>
      </Link>
      <Link to="/post">
        <li> Post </li>
      </Link>
      <Link to="/post/123">
        <li> postExample </li>
      </Link>
    </ul>
  </nav>
);

export default Nav;
