"use client";
// Necessario in quanto le componenti di Clerk vengono renderizzate solo sul client 
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("./Navbar"), { ssr: false });

export default function ClientNavbarWrapper({ className }) {
	return <Navbar className={className} />;
}
