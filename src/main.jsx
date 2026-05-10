import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/theme.css'
import App from './App.jsx'

const saved = localStorage.getItem('theme') ?? 'dark'
document.documentElement.setAttribute('data-theme', saved)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
