const MM_PRIZES = [
  { main: 5, bonus: true,  prize: 'JACKPOT' },
  { main: 5, bonus: false, prize: '$1,000,000' },
  { main: 4, bonus: true,  prize: '$10,000' },
  { main: 4, bonus: false, prize: '$500' },
  { main: 3, bonus: true,  prize: '$200' },
  { main: 3, bonus: false, prize: '$10' },
  { main: 2, bonus: true,  prize: '$10' },
  { main: 1, bonus: true,  prize: '$4' },
  { main: 0, bonus: true,  prize: '$2' },
]

const PB_PRIZES = [
  { main: 5, bonus: true,  prize: 'JACKPOT' },
  { main: 5, bonus: false, prize: '$1,000,000' },
  { main: 4, bonus: true,  prize: '$50,000' },
  { main: 4, bonus: false, prize: '$100' },
  { main: 3, bonus: true,  prize: '$100' },
  { main: 3, bonus: false, prize: '$7' },
  { main: 2, bonus: true,  prize: '$7' },
  { main: 1, bonus: true,  prize: '$4' },
  { main: 0, bonus: true,  prize: '$4' },
]

export function checkLine(line, winningNumbers, gameId) {
  const { main, bonus } = winningNumbers
  const matchedMain = line.main.filter(n => main.includes(n))
  const bonusMatched = line.bonus === bonus
  const prizes = gameId === 'megamillions' ? MM_PRIZES : PB_PRIZES
  const tier = prizes.find(p => p.main === matchedMain.length && p.bonus === bonusMatched)
  return {
    matchedMain,
    bonusMatched,
    prize: tier?.prize ?? null,
  }
}

export function parseDrawResult(record, config) {
  if (config.combinedNumbers) {
    const nums = record.winning_numbers.split(' ').map(Number)
    return { main: nums.slice(0, 5), bonus: nums[5] }
  }
  return {
    main: record.winning_numbers.split(' ').map(Number),
    bonus: Number(record[config.bonusField]),
  }
}
