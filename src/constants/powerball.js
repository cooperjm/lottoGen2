// Data sourced from NY Open Data, 1,346 draws Oct 2015 – May 2026
export const PB_MAIN_FREQ = [
   92,  97, 106,  92,  88, 103,  94,  91,  91,  89,
   98, 102,  72,  87,  92, 101,  94, 101, 100,  97,
  120,  89, 116,  96,  86,  77, 115, 117,  89,  96,
   95, 113, 114,  82,  89, 114, 106,  89, 105,  99,
   86,  94,  97, 103,  98,  79, 108,  85,  79,  95,
   89, 107, 108,  95,  87,  94,  93,  91, 105,  91,
  120, 110, 114, 117,  86,  97,  99,  96, 113,
]

export const PB_BONUS_FREQ = [
  58, 52, 52, 64, 58, 51, 44, 44, 55, 46,
  47, 44, 49, 62, 44, 39, 43, 58, 50, 58,
  62, 45, 49, 62, 57, 53,
]

export const PB_CONFIG = {
  id: 'powerball',
  label: 'Powerball',
  mainCount: 5,
  mainMax: 69,
  bonusMax: 26,
  bonusLabel: 'Power Ball',
  drawDays: [1, 3, 6], // 0=Sun, 1=Mon, 3=Wed, 6=Sat
  drawHourET: 22,
  drawMinuteET: 59,
  accentVar: '--accent-pb',
  officialUrl: 'https://www.powerball.com',
  storageKey: 'pb_saved_picks',
  cacheKey: 'pb_last_draw',
  apiEndpoint: 'https://data.ny.gov/resource/d6yy-54nr.json',
  // Powerball API returns all 6 numbers together in winning_numbers (5 main + powerball last)
  bonusField: null,
  combinedNumbers: true,
}
