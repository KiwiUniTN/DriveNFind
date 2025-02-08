"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

import {
	SignedIn,
	SignedOut,
	SignIn,
	UserButton,
	useAuth,
	useUser,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const syncUser = async (token, mail) => {
	try {
		const response = await fetch("/api/users/baseusers", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ username: mail }),
		});

		if (!response.ok) {
			throw new Error(`Failed to sync user: ${await response.text()}`);
		}

		console.log("User synced successfully");
	} catch (error) {
		console.error("Sync error:", error);
	}
};
const Navbar = ({ className }) => {
	const { isSignedIn, getToken } = useAuth();
	const { user } = useUser();
	const [isClient, setIsClient] = useState(false); // State to check if it's client-side
	const pathname = usePathname();// State to hold the router object

	// Only run useRouter on the client-side
	useEffect(() => {
		setIsClient(true);
	}, []);

	const isOnReportsPage = pathname === "/reports";
	// Sincronizzo Clerk con il nostro db
	useEffect(() => {
		if (isSignedIn && user) {
			const getUserTokenandSync = async () => {
				const token = await getToken();
				syncUser(token, user.emailAddresses[0].emailAddress);
			};
			getUserTokenandSync();
		}
	}, [isSignedIn, user]);
	return (
		<nav
			className={`${className} bg-[#ffffe3] flex flex-wrap p-1 justify-between align-middle`}>
			<div className='relative w-1/12 h-16'>
				<Image
					src='/LogoDriveNFind.png'
					alt='Logo'
					fill
					className='object-contain'
					sizes='(max-width: 768px) 10vw, (max-width: 1200px) 5vw, 3vw'
				/>
			</div>
			<div className='flex items-center justify-center w-1/12 h-16 mx-10 gap-2'>
				<SignedOut>
					<div className='dropdown dropdown-bottom dropdown-left flex items-center'>
						<button className='poppins-semibold btn btn-xs text-white bg-[#ad181a] border-none sm:btn-sm md:btn-md lg:btn-lg z-10 h-auto flex items-center hover:bg-slate-900'>
							ACCEDI
						</button>
						<div className='dropdown-content card card-compact z-[1]'>
							<div className='card-body'>
								<SignIn routing='hash' />
							</div>
						</div>
					</div>
				</SignedOut>
				<SignedIn>
					<Link
						href={isOnReportsPage ? "/" : "/reports"}
						className='raleway-regular btn btn-outline'>
						{isOnReportsPage ? "Home" : "Segnalazioni"}
					</Link>
					<UserButton showName className='raleway-regular' />
				</SignedIn>
			</div>
		</nav>
	);
};

export default Navbar;
