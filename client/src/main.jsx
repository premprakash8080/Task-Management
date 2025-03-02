import React from 'react';
import ReactDOM from 'react-dom/client';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHome, faList, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './index.css'; // Import Tailwind CSS
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

// Initialize FontAwesome library
library.add(faHome, faList, faCog, faSignOutAlt);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);