export type Site = {
  TITLE: string
  DESCRIPTION: string
  EMAIL: string
  NUM_POSTS_ON_HOMEPAGE: number
  POSTS_PER_PAGE: number
  SITEURL: string
}

export type Link = {
  href: string
  label: string
}

export const SITE: Site = {
  TITLE: 'Souvik Kar Mahapatra',
  DESCRIPTION:
    'Souvik Kar Mahapatra is a builder who creates tools focused on automating boring tasks and solving real-world problems, and shares what he learns.',
  EMAIL: 'souvikat001@gmail.com',
  NUM_POSTS_ON_HOMEPAGE: 5,
  POSTS_PER_PAGE: 5,
  SITEURL: 'https://souvikinator.xyz',
}

export const NAV_LINKS: Link[] = [
  { href: '/', label: 'home' },
  { href: '/blog', label: 'blog' },
  { href: '/work', label: 'work' },
]

export const SOCIAL_LINKS: Link[] = [
  { href: 'https://github.com/souvikinator', label: 'GitHub' },
  { href: 'https://x.com/souvikinator', label: 'Twitter' },
  { href: 'https://linkedin.com/in/souvik-kar-mahapatra', label: 'LinkedIn' },
  { href: 'mailto:souvikat001@gmail.com', label: 'Email' },
  { href: '/rss.xml', label: 'RSS' },
]
