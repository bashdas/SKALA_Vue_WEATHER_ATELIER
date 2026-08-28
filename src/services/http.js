import axios from 'axios'

export const weatherHttp = axios.create({ baseURL: 'https://api.openweathermap.org/data/2.5', timeout: 10000 })
export const geocodingHttp = axios.create({ baseURL: 'https://geocoding-api.open-meteo.com/v1', timeout: 8000 })

export function readableApiError(error) {
  if (error.code === 'ECONNABORTED') return '서버 응답 시간이 초과되었습니다.'
  if (!error.response) return '네트워크 연결을 확인해주세요.'
  if (error.response.status === 401) return '날씨 API 키가 아직 활성화되지 않았거나 유효하지 않습니다.'
  if (error.response.status === 404) return '도시 날씨를 찾지 못했습니다.'
  return '날씨 정보를 불러오지 못했습니다.'
}
