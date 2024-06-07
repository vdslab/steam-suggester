export async function getNextAPIData(url: string) {

  const res = await fetch(`http://localhost:3000${url}`)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}
