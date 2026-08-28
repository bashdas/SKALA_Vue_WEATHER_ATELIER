import { geocodingHttp } from './http'

export async function searchCities(name) {
  const { data } = await geocodingHttp.get('/search', { params: { name, count: 5, language: 'ko', format: 'json' } })
  return data.results ?? []
}
