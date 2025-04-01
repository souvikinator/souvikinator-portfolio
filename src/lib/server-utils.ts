import { getEntry } from 'astro:content'
import path from 'path'
import fs from 'fs'

export async function parseAuthors(authors: string[]) {
  if (!authors || authors.length === 0) return []

  const parseAuthor = async (id: string) => {
    try {
      const author = await getEntry('authors', id)
      return {
        id,
        name: author?.data?.name || id,
        avatar: author?.data?.avatar || '/static/logo.png',
        isRegistered: !!author,
      }
    } catch (error) {
      console.error(`Error fetching author with id ${id}:`, error)
      return {
        id,
        name: id,
        avatar: '/static/logo.png',
        isRegistered: false,
      }
    }
  }

  return await Promise.all(authors.map(parseAuthor))
}

export async function getPhotoCount(albumId: string): Promise<number> {
  const publicDir = path.join(process.cwd(), 'public', 'images', albumId)

  try {
    const files = fs.readdirSync(publicDir)
    const webpFiles = files.filter((file) => file.endsWith('.webp'))
    return webpFiles.length
  } catch (error) {
    console.error('Error counting photos:', error)
    return 0
  }
}
