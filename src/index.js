import React from 'react'
import ReactDOM from 'react-dom/client'  // Use 'react-dom/client' instead of 'react-dom'
import './index.css'
import App from './App'
import { BrowserRouter as Router } from 'react-router-dom'

// Get the root DOM element
const rootElement = document.getElementById('root')

// Create a root and render the App
const root = ReactDOM.createRoot(rootElement)
root.render(
  <Router>
    <App />
  </Router>
)
