// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css'; // Global styles
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

