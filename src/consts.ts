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
  TITLE: 'Emile Choghi',
  DESCRIPTION:
    'Emile Choghi is a software engineer who specializes in building useful digital experiences.',
  EMAIL: 'echoghi@rennalabs.xyz',
  NUM_POSTS_ON_HOMEPAGE: 2,
  POSTS_PER_PAGE: 3,
  SITEURL: 'https://emile.sh',
}

export const NAV_LINKS: Link[] = [
  { href: '/', label: 'home' },
  { href: '/blog', label: 'blog' },
  { href: '/tags', label: 'tags' },
]

export const SOCIAL_LINKS: Link[] = [
  { href: 'https://github.com/echoghi', label: 'GitHub' },
  { href: 'https://twitter.com/echoghi', label: 'Twitter' },
  { href: 'echoghi@rennalabs.xyz', label: 'Email' },
  { href: '/rss.xml', label: 'RSS' },
]
