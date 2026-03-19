export default defineEventHandler(async (event) => {
  const { q } = getQuery(event)
  if (!q) return { images: [] }

  const config = useRuntimeConfig()

  try {
    const data: any = await $fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': config.serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q, num: 20 }),
    })

    const images = (data.images ?? []).map((item: any) => item.imageUrl).filter(Boolean)
    return { images }
  } catch (e: any) {
    return { images: [], error: e.message }
  }
})
