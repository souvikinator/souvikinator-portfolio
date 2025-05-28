import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BellPlus } from 'lucide-react'
import JSConfetti from 'js-confetti'
import { SubscribeForm } from './SubscribeForm'

// Duration in milliseconds for the success message to stay visible
const SUCCESS_MESSAGE_DURATION = 5000

export function SubscribeBox() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [showSuccess, setShowSuccess] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [progressActive, setProgressActive] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const confettiRef = useRef<JSConfetti>()
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    confettiRef.current = new JSConfetti()
  }, [])

  useEffect(() => {
    // Clean up timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Trigger progress bar animation when showSuccess is set
  useEffect(() => {
    if (showSuccess) {
      setIsExiting(false)
      setProgressActive(false)
      // Allow DOM to paint before starting transition
      const raf = requestAnimationFrame(() => setProgressActive(true))
      // After the progress bar duration, fade out the card
      timeoutRef.current = setTimeout(() => {
        setIsExiting(true)
        // After fade out, hide the card
        setTimeout(() => setShowSuccess(false), 300)
      }, SUCCESS_MESSAGE_DURATION)
      return () => {
        cancelAnimationFrame(raf)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    } else {
      setProgressActive(false)
      setIsExiting(false)
    }
  }, [showSuccess])

  const popEmojiConfetti = () => {
    confettiRef.current?.addConfetti({
      emojis: ['💪'],
      emojiSize: 64,
      confettiNumber: 28,
    })
  }

  const handleSubscribe = async (email: string) => {
    setError(undefined)
    setIsLoading(true)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Subscription failed')
      }

      // Send GA event
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // @ts-ignore
        window.gtag('event', 'subscribe', {
          event_category: 'engagement',
          event_label: 'newsletter',
        })
      }

      setShowSuccess(true)
      if (dialogRef.current?.open) {
        dialogRef.current.close()
      }
      popEmojiConfetti()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalOpen = () => {
    if (
      dialogRef.current &&
      typeof dialogRef.current.showModal === 'function'
    ) {
      dialogRef.current.showModal()
      setIsModalOpen(true)
    }
  }

  const handleModalClose = () => {
    if (dialogRef.current) {
      dialogRef.current.close()
      setIsModalOpen(false)
    }
  }

  if (showSuccess) {
    return (
      <Card
        className={`fixed bottom-6 right-6 z-40 w-80 min-w-[250px] transition-opacity duration-300 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-2 p-4">
          <span className="text-base font-medium text-foreground">
            Thank you for investing in souvikinator, won't let you down 💪
          </span>
        </div>
        <div
          className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-[5000ms] ease-linear"
          style={{
            width: progressActive ? '0%' : '100%',
          }}
        />
      </Card>
    )
  }

  return (
    <>
      {/* Desktop Form */}
      <div className="fixed bottom-6 right-6 z-40 hidden w-80 min-w-[250px] md:block">
        <SubscribeForm
          id="desktop-subscribe-form"
          onSubscribe={handleSubscribe}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Mobile Button */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-7 right-[2rem] z-40 md:hidden"
        aria-label="Subscribe"
        onClick={handleModalOpen}
      >
        <BellPlus className="h-5 w-5" />
      </Button>

      {/* Modal */}
      <dialog
        ref={dialogRef}
        className="z-50 w-11/12 max-w-sm rounded-lg border-none bg-transparent p-0 backdrop:bg-background/80 backdrop:backdrop-blur-sm"
        onClose={() => setIsModalOpen(false)}
      >
        <div className="p-3">
          <SubscribeForm
            id="mobile-subscribe-form"
            showCancel={true}
            onCancel={handleModalClose}
            onSubscribe={handleSubscribe}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </dialog>

      {/* Confetti Container */}
      <div className="pointer-events-none fixed inset-0 z-30" />
    </>
  )
}
