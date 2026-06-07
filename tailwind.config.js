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
        // Emerald accent scale. NOTE: still named `violet` so the ~34 files that use
        // `bg-violet/15`, `text-violet`, `border-violet`, `ring-violet/…` recolor to
        // emerald for free (no per-file edits). The name is a misnomer — a later
        // mechanical `violet`→`brand` rename is a clean follow-up. New code uses
        // `brand` / `sky` / `spark` (token-backed) instead.
        violet: {
          DEFAULT: '#059669',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
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
        // Readable accent text/icon color — deep emerald (light) ↔ bright emerald (dark).
        brand: {
          DEFAULT: 'hsl(var(--brand) / <alpha-value>)',
          strong: 'hsl(var(--brand-strong) / <alpha-value>)',
        },
        // Powder-blue cool support accent.
        sky: {
          DEFAULT: 'hsl(var(--sky) / <alpha-value>)',
          strong: 'hsl(var(--sky-strong) / <alpha-value>)',
        },
        // Orange "spark" — the rare warm accent (urgency chips, hero horizon). Use sparingly.
        spark: {
          DEFAULT: 'hsl(var(--spark) / <alpha-value>)',
          strong: 'hsl(var(--spark-strong) / <alpha-value>)',
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
        glow: '0 0 40px rgba(5, 150, 105, 0.3)',
        'glow-lg': '0 0 80px rgba(5, 150, 105, 0.4)',
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
