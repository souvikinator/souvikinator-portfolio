import React from 'react'
import { cn } from '@/lib/utils'
import type { ImageMetadata } from 'astro'

interface VideoProps
  extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  className?: string
  src: string | ImageMetadata
}

const Video = React.forwardRef<HTMLVideoElement, VideoProps>(
  ({ className, src, ...props }, ref) => {
    // Handle both string and ImageMetadata src types
    const videoSrc = typeof src === 'string' ? src : src.src

    return (
      <div className="relative w-full">
        <video
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-muted',
            'controls',
            className,
          )}
          controls={true}
          src={videoSrc}
          {...props}
        />
      </div>
    )
  },
)

Video.displayName = 'Video'

export { Video }
