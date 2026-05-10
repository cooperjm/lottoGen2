export function ThemeToggle({ dark, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
