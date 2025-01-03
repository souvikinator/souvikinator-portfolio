import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { NAV_LINKS } from '@/consts'
import { List, Menu, Newspaper, Tags, X } from 'lucide-react'

const iconMap = {
  blog: () => <Newspaper className="h-6 w-6" />,
  tags: () => <Tags className="h-6 w-6" />,
  work: () => <List className="h-6 w-6" />,
} as Record<string, () => JSX.Element>

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleViewTransitionStart = () => {
      setIsOpen(false)
    }

    document.addEventListener('astro:before-swap', handleViewTransitionStart)
    return () => {
      document.removeEventListener(
        'astro:before-swap',
        handleViewTransitionStart,
      )
    }
  }, [])

  return (
    <div className="flex flex-col items-center lg:hidden">
      <Button
        onClick={toggleMenu}
        className="z-50 bg-background p-2 text-primary focus:outline-none"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="fixed left-0 top-0 z-10 w-full bg-background pb-10 pt-[68px]">
          <div className="space-y-4 p-4">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-md flex w-full items-center justify-start space-x-4 px-4 text-center font-medium capitalize"
                onClick={() => setIsOpen(false)}
              >
                {iconMap[item.label]()}
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileMenu
