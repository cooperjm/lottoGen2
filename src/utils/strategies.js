import { MM_MAIN_FREQ, MM_BONUS_FREQ } from '../constants/megamillions.js'
import { PB_MAIN_FREQ, PB_BONUS_FREQ } from '../constants/powerball.js'

function getFreqData(config) {
  return config.id === 'megamillions'
    ? { mainFreq: MM_MAIN_FREQ, bonusFreq: MM_BONUS_FREQ }
    : { mainFreq: PB_MAIN_FREQ, bonusFreq: PB_BONUS_FREQ }
}

function getStats(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  const std = Math.sqrt(arr.reduce((t, f) => t + (f - mean) ** 2, 0) / arr.length)
  return { mean, std }
}

export function getTier(freq, mean, std) {
  if (freq >= mean + std) return 'hot'
  if (freq >= mean + std * 0.35) return 'warm'
  if (freq >= mean - std * 0.35) return 'avg'
  if (freq >= mean - std) return 'cool'
  return 'cold'
}

function weightedSample(pool, count) {
  const avail = pool.map(b => ({ ...b }))
  const picks = []
  for (let i = 0; i < count && avail.length > 0; i++) {
    const tot = avail.reduce((s, b) => s + b.w, 0)
    let r = Math.random() * tot
    let idx = 0
    for (; idx < avail.length - 1; idx++) {
      r -= avail[idx].w
      if (r <= 0) break
    }
    picks.push(avail[idx].n)
    avail.splice(idx, 1)
  }
  return picks.sort((a, b) => a - b)
}

// Build a weighted pool from a frequency array.
// invert=true: take the `size` lowest-freq entries, weight cold numbers higher.
function buildPool(freq, size, { invert = false } = {}) {
  const sorted = freq
    .map((f, i) => ({ n: i + 1, w: f }))
    .sort((a, b) => invert ? a.w - b.w : b.w - a.w)
  const pool = sorted.slice(0, size)
  if (!invert) return pool
  const maxW = sorted[sorted.length - 1].w
  return pool.map(b => ({ n: b.n, w: maxW - b.w + 1 }))
}

function uniformSample(max, count) {
  const pool = Array.from({ length: max }, (_, i) => i + 1)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count).sort((a, b) => a - b)
}

// Strategy 1: Hot Streak — top 20 most-drawn, weighted by frequency
export function hotStreak(config) {
  const { mainFreq, bonusFreq } = getFreqData(config)
  return {
    main: weightedSample(buildPool(mainFreq, 20), config.mainCount),
    bonus: weightedSample(buildPool(bonusFreq, 10), 1)[0],
  }
}

// Strategy 2: Due Numbers — 20 least-drawn, inverted weight
export function dueNumbers(config) {
  const { mainFreq, bonusFreq } = getFreqData(config)
  return {
    main: weightedSample(buildPool(mainFreq, 20, { invert: true }), config.mainCount),
    bonus: weightedSample(buildPool(bonusFreq, 10, { invert: true }), 1)[0],
  }
}

// Strategy 3: Balanced — one ball from each frequency tier
export function balanced(config) {
  const { mainFreq, bonusFreq } = getFreqData(config)
  const { mean, std } = getStats(mainFreq)
  const tiers = { hot: [], warm: [], avg: [], cool: [], cold: [] }
  mainFreq.forEach((f, i) => { tiers[getTier(f, mean, std)].push(i + 1) })
  const main = []
  for (const tier of ['hot', 'warm', 'avg', 'cool', 'cold']) {
    if (main.length >= config.mainCount) break
    const pool = tiers[tier]
    if (pool.length > 0) main.push(pool[Math.floor(Math.random() * pool.length)])
  }
  while (main.length < config.mainCount) {
    const n = Math.floor(Math.random() * config.mainMax) + 1
    if (!main.includes(n)) main.push(n)
  }
  return { main: main.sort((a, b) => a - b), bonus: Math.floor(Math.random() * config.bonusMax) + 1 }
}

// Strategy 4: Smart Random — frequency-weighted across all balls
export function smartRandom(config) {
  const { mainFreq, bonusFreq } = getFreqData(config)
  return {
    main: weightedSample(mainFreq.map((f, i) => ({ n: i + 1, w: f })), config.mainCount),
    bonus: weightedSample(bonusFreq.map((f, i) => ({ n: i + 1, w: f })), 1)[0],
  }
}

// Strategy 5: True Random — pure uniform quick pick
export function trueRandom(config) {
  return {
    main: uniformSample(config.mainMax, config.mainCount),
    bonus: Math.floor(Math.random() * config.bonusMax) + 1,
  }
}

export const STRATEGIES = [
  { id: 'hotStreak',   label: 'Hot Streak',   desc: 'Favors the most frequently drawn numbers',   fn: hotStreak },
  { id: 'dueNumbers',  label: 'Due Numbers',  desc: 'Favors numbers that are overdue to appear',  fn: dueNumbers },
  { id: 'balanced',    label: 'Balanced',     desc: 'One pick from each frequency tier',           fn: balanced },
  { id: 'smartRandom', label: 'Smart Random', desc: 'Frequency-weighted across all numbers',       fn: smartRandom },
  { id: 'trueRandom',  label: 'True Random',  desc: 'Pure random — same odds as a Quick Pick',    fn: trueRandom },
]
