import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['selector'],
  content: ['./src/**/*.{astro,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      typography: {
        flexoki: {
          css: {
            '--tw-prose-body': 'hsl(var(--flexoki-tx))',
            '--tw-prose-headings': 'hsl(var(--flexoki-tx))',
            '--tw-prose-lead': 'hsl(var(--flexoki-tx-2))',
            '--tw-prose-links': 'hsl(var(--flexoki-tx))',
            '--tw-prose-bold': 'hsl(var(--flexoki-tx))',
            '--tw-prose-counters': 'hsl(var(--flexoki-tx-2))',
            '--tw-prose-bullets': 'hsl(var(--flexoki-tx-3))',
            '--tw-prose-hr': 'hsl(var(--flexoki-ui-2))',
            '--tw-prose-quotes': 'hsl(var(--flexoki-tx))',
            '--tw-prose-quote-borders': 'hsl(var(--flexoki-ui-2))',
            '--tw-prose-captions': 'hsl(var(--flexoki-tx-2))',
            '--tw-prose-code': 'hsl(var(--flexoki-tx))',
            '--tw-prose-pre-code': 'hsl(var(--flexoki-tx))',
            '--tw-prose-pre-bg': 'hsl(var(--flexoki-ui))',
            '--tw-prose-th-borders': 'hsl(var(--flexoki-ui-2))',
            '--tw-prose-td-borders': 'hsl(var(--flexoki-ui-2))',

            // Dark mode overrides
            '--tw-prose-invert-body': 'hsl(var(--flexoki-tx))',
            '--tw-prose-invert-headings': 'hsl(var(--flexoki-tx))',
            '--tw-prose-invert-lead': 'hsl(var(--flexoki-tx-2))',
            '--tw-prose-invert-links': 'hsl(var(--flexoki-tx))',
            '--tw-prose-invert-bold': 'hsl(var(--flexoki-tx))',
            '--tw-prose-invert-counters': 'hsl(var(--flexoki-tx-2))',
            '--tw-prose-invert-bullets': 'hsl(var(--flexoki-tx-3))',
            '--tw-prose-invert-hr': 'hsl(var(--flexoki-ui-2))',
            '--tw-prose-invert-quotes': 'hsl(var(--flexoki-tx))',
            '--tw-prose-invert-quote-borders': 'hsl(var(--flexoki-ui-2))',
            '--tw-prose-invert-captions': 'hsl(var(--flexoki-tx-2))',
            '--tw-prose-invert-code': 'hsl(var(--flexoki-tx))',
            '--tw-prose-invert-pre-code': 'hsl(var(--flexoki-tx))',
            '--tw-prose-invert-pre-bg': 'hsl(var(--flexoki-ui))',
            '--tw-prose-invert-th-borders': 'hsl(var(--flexoki-ui-2))',
            '--tw-prose-invert-td-borders': 'hsl(var(--flexoki-ui-2))',
          },
        },
      },
      fontFamily: {
        sans: ['Geist', ...defaultTheme.fontFamily.sans],
        mono: ['Geist Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        additive: {
          DEFAULT: 'hsl(var(--additive))',
          foreground: 'hsl(var(--additive-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fade: 'fadeIn 0.3s ease-in-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
}

export default config
