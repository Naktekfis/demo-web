export const CHECKIN_VENUES = [
  { id: 'sabuga', name: 'Sasana Budaya Ganesha', lat: -6.896, lng: 107.6096, radiusMeters: 180 },
  { id: 'aula-timur', name: 'Aula Timur ITB', lat: -6.8926, lng: 107.6108, radiusMeters: 120 },
]

export function calculateDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radius = 6371e3
  const p1 = lat1 * Math.PI / 180
  const p2 = lat2 * Math.PI / 180
  const dp = (lat2 - lat1) * Math.PI / 180
  const dl = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getNearestCheckinVenue(lat: number, lng: number) {
  return CHECKIN_VENUES
    .map((venue) => ({ ...venue, distanceMeters: calculateDistanceMeters(lat, lng, venue.lat, venue.lng) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)[0]
}
