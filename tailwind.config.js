/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // <alpha-value> so translucent headers/overlays (bg-background/60..80) work.
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          // <alpha-value> so frosted dropdowns / command palette (bg-popover/95) work.
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Sunset-orange accent scale. NOTE: still named `violet` so the ~34 files that
        // use `bg-violet/15`, `text-violet`, `border-violet`, `ring-violet/…` recolor to
        // sunset for free (no per-file edits). The name is now a misnomer — a later
        // mechanical `violet`→`sunset` rename is a clean follow-up. New code uses
        // `brand` / `sky` (token-backed) instead.
        violet: {
          DEFAULT: '#F4763B',
          50: '#FFF4EC',
          100: '#FFE6D6',
          200: '#FFC9A8',
          300: '#FFA877',
          400: '#FF8A5B',
          500: '#F4763B',
          600: '#E2592A',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        dark: {
          DEFAULT: '#05050B',
          100: '#0B0B14',
          200: '#12121F',
          300: '#1A1A2E',
        },
        text: {
          primary: 'hsl(var(--foreground) / <alpha-value>)',
          secondary: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        // Readable accent text/icon color — deep sunset orange (light) ↔ warm amber (dark).
        brand: {
          DEFAULT: 'hsl(var(--brand) / <alpha-value>)',
          strong: 'hsl(var(--brand-strong) / <alpha-value>)',
        },
        // Powder-blue secondary accent — the cool half of the sunset palette.
        sky: {
          DEFAULT: 'hsl(var(--sky) / <alpha-value>)',
          strong: 'hsl(var(--sky-strong) / <alpha-value>)',
        },
        // Semantic accents — flip to readable deep shades on light, bright on dark.
        pos: 'hsl(var(--pos) / <alpha-value>)',
        neg: 'hsl(var(--neg) / <alpha-value>)',
        warn: 'hsl(var(--warn) / <alpha-value>)',
        // Theme-aware hairlines and subtle surface fills (replace inline white/black alphas).
        hairline: {
          DEFAULT: 'var(--hairline)',
          strong: 'var(--hairline-strong)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          strong: 'var(--surface-strong)',
        },
        panel: 'var(--panel)',
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        sans: ['Hanken Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '22px',
        'xl': '16px',
        'lg': '14px',
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: '0 24px 80px rgba(0, 0, 0, 0.55)',
        button: '0 10px 30px rgba(0, 0, 0, 0.35)',
        glow: '0 0 40px rgba(244, 118, 59, 0.3)',
        'glow-lg': '0 0 80px rgba(244, 118, 59, 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.75" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "float": "float 3.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
