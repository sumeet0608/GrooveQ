import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: "2rem",
  		screens: {
  			"2xl": "1400px",
  		},
  	},
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// Custom colors
  			dark: "#1A1F2C",
  			"dark-purple": "#403E43",
  			"mid-purple": "#7E69AB",
  			"light-purple": "#9b87f5",
  			"neon-purple": "#b980ff",
  			solana: "#14F195",
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
  			wave: {
  				"0%": { transform: "scaleY(1)" },
  				"50%": { transform: "scaleY(0.5)" },
  				"100%": { transform: "scaleY(1)" },
  			},
  			pulse: {
  				"0%, 100%": { opacity: "1" },
  				"50%": { opacity: "0.5" },
  			},
  			float: {
  				"0%, 100%": { transform: "translateY(0)" },
  				"50%": { transform: "translateY(-10px)" },
  			},
  		},
  		animation: {
  			"accordion-down": "accordion-down 0.2s ease-out",
  			"accordion-up": "accordion-up 0.2s ease-out",
  			"wave-1": "wave 1.2s linear infinite",
  			"wave-2": "wave 1.6s linear infinite",
  			"wave-3": "wave 1.8s linear infinite",
  			"wave-4": "wave 2.2s linear infinite",
  			"wave-5": "wave 2.4s linear infinite",
  			"pulse-slow": "pulse 3s ease-in-out infinite",
  			float: "float 6s ease-in-out infinite",
  		},
  		backgroundImage: {
  			"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
  			"hero-pattern": "url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60')",
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
