import { useState, useEffect } from 'react'
import { MM_CONFIG } from './constants/megamillions.js'
import { PB_CONFIG } from './constants/powerball.js'
import { GameTab } from './components/GameTab.jsx'
import { ThemeToggle } from './components/ThemeToggle.jsx'
import { MegaMillionsLogo, PowerballLogo } from './components/Logos.jsx'
import './styles/app.css'

const GAMES = [MM_CONFIG, PB_CONFIG]

export default function App() {
  const [activeGame, setActiveGame] = useState('megamillions')
  const [dark, setDark] = useState(() => (localStorage.getItem('theme') ?? 'dark') === 'dark')

  useEffect(() => {
    const theme = dark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [dark])

  const config = GAMES.find(g => g.id === activeGame)

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-logo">
            {activeGame === 'megamillions'
              ? <MegaMillionsLogo size={36} />
              : <PowerballLogo size={36} />
            }
          </div>
          <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
        </div>
        <nav className="tab-nav" role="tablist">
          {GAMES.map(g => (
            <button
              key={g.id}
              role="tab"
              aria-selected={activeGame === g.id}
              className={`tab-btn${activeGame === g.id ? ' tab-btn--active' : ''} tab-btn--${g.id}`}
              onClick={() => setActiveGame(g.id)}
            >
              {g.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <GameTab key={activeGame} config={config} />
      </main>

      <footer className="app-footer">
        <p>For entertainment only. Please play responsibly.</p>
      </footer>
    </div>
  )
}
