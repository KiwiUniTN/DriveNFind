import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { itIT } from "@clerk/localizations";


export const metadata = {
  title: "DriveNFind",
  description: "Generated by create next app",
  icons: {
    icon:'/LogoDriveNFind.png',
  }
};

export default function RootLayout({ children }) {
  return (
		<ClerkProvider localization={itIT}>
			<html lang='it'>
				<body>{children}</body>
			</html>
		</ClerkProvider>
	);
}
