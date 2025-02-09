/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				nero: "var(--nero)",
				bianco: "var(--bianco)",
				grigio: "var(--grigio)",
				begie: "var(--beige)",
				rosso: "var(--rosso)",
				marrone: "var(--marrone)",
				grigioChiaro: "var(--grigioChiaro)",
				azzurro: "var(--azzurro)",
				trasparente: "var(--trasparente)",
				azzurroChiaro: "var(--azzurroChiaro)",
				beigeChiaro: "var(--beigeChiaro)",
			},
			fontFamily: {
				poppins: ["Poppins", "sans-serif"],
			},
		},
	},
	
	daisyui: {
		themes: [
			{
				mytheme: {
					primary: "#ffffff",
					secondary: "#000000",
					accent: "#c1141a",
					neutral: "#1c2424",
					"base-100": "#ededed",
				},
			},
			"dark",
			"cupcake",
		],
		
	},
	plugins: [require("daisyui")],
};
