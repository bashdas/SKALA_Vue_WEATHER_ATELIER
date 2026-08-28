export const fallbackCities = [
  { id: 'seoul', name: '서울', country: 'KR', lat: 37.5665, lon: 126.978, temp: 28, feelsLike: 30, status: '맑음', icon: '01d', humidity: 58, rain: 10, wind: 2.1 },
  { id: 'suwon', name: '수원', country: 'KR', lat: 37.2636, lon: 127.0286, temp: 24, feelsLike: 25, status: '비', icon: '10d', humidity: 82, rain: 80, wind: 3.4 },
  { id: 'busan', name: '부산', country: 'KR', lat: 35.1796, lon: 129.0756, temp: 26, feelsLike: 28, status: '구름', icon: '03d', humidity: 70, rain: 30, wind: 4.2 },
  { id: 'jeju', name: '제주', country: 'KR', lat: 33.4996, lon: 126.5312, temp: 23, feelsLike: 22, status: '바람', icon: '04d', humidity: 76, rain: 20, wind: 7.6 },
  { id: 'daegu', name: '대구', country: 'KR', lat: 35.8714, lon: 128.6014, temp: 31, feelsLike: 34, status: '쾌청', icon: '02d', humidity: 49, rain: 0, wind: 1.8 },
]

export const weatherEmoji = (icon = '') => {
  if (icon.startsWith('01')) return '☀️'
  if (icon.startsWith('02')) return '🌤️'
  if (icon.startsWith('03') || icon.startsWith('04')) return '☁️'
  if (icon.startsWith('09') || icon.startsWith('10')) return '🌧️'
  if (icon.startsWith('11')) return '⛈️'
  if (icon.startsWith('13')) return '❄️'
  return '🌫️'
}
