function getETComponents(date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: false,
  })
  const p = Object.fromEntries(fmt.formatToParts(date).map(x => [x.type, x.value]))
  const y = parseInt(p.year), m = parseInt(p.month), d = parseInt(p.day)
  // Derive day-of-week from ET calendar date to avoid timezone confusion
  return {
    day: new Date(Date.UTC(y, m - 1, d)).getUTCDay(),
    hour: parseInt(p.hour),
    minute: parseInt(p.minute),
    year: y, month: m, date: d,
  }
}

// Convert an ET local datetime to a UTC Date, handling EST/EDT automatically.
function etLocalToUTC(year, month, day, hour, minute) {
  // Start with UTC-5 (EST) approximation — Date.UTC handles hour overflow correctly
  const candidate = new Date(Date.UTC(year, month - 1, day, hour + 5, minute))
  // Check the actual ET hour to detect if EDT (UTC-4) applies instead
  const etHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', hour: 'numeric', hour12: false,
    }).formatToParts(candidate).find(p => p.type === 'hour').value
  )
  let diff = hour - etHour
  // Normalize across midnight wrap (e.g. diff=23 really means -1)
  if (diff > 12) diff -= 24
  if (diff < -12) diff += 24
  return new Date(candidate.getTime() + diff * 3_600_000)
}

export function getNextDrawDate(config) {
  const now = new Date()
  const et = getETComponents(now)
  const drawHour = config.drawHourET
  const drawMinute = config.drawMinuteET

  let minDaysAway = 8
  for (const drawDay of config.drawDays) {
    let daysAway = (drawDay - et.day + 7) % 7
    if (daysAway === 0) {
      const pastDraw = et.hour > drawHour || (et.hour === drawHour && et.minute > drawMinute)
      if (pastDraw) daysAway = 7
    }
    if (daysAway < minDaysAway) minDaysAway = daysAway
  }

  // Advance the ET calendar date by daysAway (Date.UTC handles month/year overflow)
  const nextUTCDate = new Date(Date.UTC(et.year, et.month - 1, et.date + minDaysAway))
  return etLocalToUTC(
    nextUTCDate.getUTCFullYear(),
    nextUTCDate.getUTCMonth() + 1,
    nextUTCDate.getUTCDate(),
    drawHour,
    drawMinute,
  )
}

export function formatCountdown(ms) {
  if (ms <= 0) return '0d 00h 00m 00s'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`
}

export function formatDrawDate(date) {
  return date.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long', month: 'long', day: 'numeric',
  })
}
