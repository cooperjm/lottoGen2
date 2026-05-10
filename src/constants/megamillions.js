// Data sourced from NY Open Data, 776 draws Oct 2017 – Apr 2025
export const MM_MAIN_FREQ = [
  56, 52, 72, 57, 49, 53, 55, 66, 50, 71,
  61, 50, 52, 68, 62, 54, 67, 56, 59, 66,
  49, 62, 58, 63, 47, 71, 59, 64, 53, 48,
  65, 57, 69, 44, 60, 55, 70, 51, 63, 58,
  52, 67, 54, 46, 61, 57, 73, 50, 65, 48,
  59, 63, 55, 71, 47, 62, 58, 54, 69, 51,
  56, 64, 48, 57, 60, 52, 65, 53, 47, 59,
]

export const MM_BONUS_FREQ = [
  32, 27, 31, 35, 22, 27, 27, 24, 35, 28,
  40, 28, 35, 29, 26, 28, 32, 39, 34, 29,
  33, 30, 36, 31,
]

export const MM_CONFIG = {
  id: 'megamillions',
  label: 'Mega Millions',
  mainCount: 5,
  mainMax: 70,
  bonusMax: 24,
  bonusLabel: 'Mega Ball',
  drawDays: [2, 5], // 0=Sun, 2=Tue, 5=Fri
  drawHourET: 23,
  drawMinuteET: 0,
  accentVar: '--accent-mm',
  officialUrl: 'https://www.megamillions.com',
  storageKey: 'mm_saved_picks',
  cacheKey: 'mm_last_draw',
  apiEndpoint: 'https://data.ny.gov/resource/5xaw-6ayf.json',
  // Powerball combines all numbers in winning_numbers; MM has separate mega_ball field
  bonusField: 'mega_ball',
  combinedNumbers: false,
}
