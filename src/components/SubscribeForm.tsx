import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, X } from 'lucide-react'
import { useState } from 'react'

interface SubscribeFormProps {
  id: string
  showCancel?: boolean
  onCancel?: () => void
  onSubscribe: (email: string) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function SubscribeForm({
  id,
  showCancel = false,
  onCancel,
  onSubscribe,
  isLoading = false,
  error,
}: SubscribeFormProps) {
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubscribe(email)
  }

  return (
    <Card id={id} className="relative border-border bg-background shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
        {showCancel && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onCancel}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <h2 className="text-lg font-bold text-foreground">
          Invest in <span className="text-primary">souvikinator 🚀</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Get new posts & project updates delivered straight to your inbox. You
          won't regret it!
        </p>

        <div className="relative w-full">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Your email"
            className="pr-10"
          />
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M4 4h16v16H4z" stroke="none" />
            <path d="M22 6.5V17a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 17V6.5M22 6.5A2.5 2.5 0 0019.5 4h-15A2.5 2.5 0 002 6.5m20 0l-10 7-10-7" />
          </svg>
        </div>

        <Button
          type="submit"
          className="mt-2 w-full"
          variant="default"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Subscribe'
          )}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </Card>
  )
}
