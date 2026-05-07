// src/index.js
// This is the very first file that runs in a React app.
// It grabs the <div id="root"> from public/index.html and renders our App into it.

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
