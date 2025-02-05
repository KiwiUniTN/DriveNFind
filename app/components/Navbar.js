"use client";
import React from "react";
import Image from "next/image";
import Reports from "./Reports";


import {
	SignedIn,
	SignedOut,
	SignIn,
	UserButton,
	useAuth,
	useUser,
} from "@clerk/nextjs";
import { useEffect } from "react";
const Navbar = ({ className }) => {
	const { isSignedIn } = useAuth();
	const { user } = useUser();
	// Sincronizzo Clerk con il nostro db
	
	useEffect(() => {
		if (isSignedIn && user && user != undefined) {
			const syncUser = async () => {
				try {
					await fetch("/api/users/baseusers", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							username: user.emailAddresses[0].emailAddress,

						}),
					});
				} catch (error) {
					console.log("Error during authion sync:", error);
					
				}
			};

			syncUser();
		}
	}, [isSignedIn, user]);
	return (
		<nav
			className={`${className} flex flex-wrap p-1 justify-between align-middle`}>
			<div className='relative w-1/12 h-16'>
				<Image
					src='/LogoDriveNFind.png'
					alt='Logo'
					fill
					className='object-contain'
					sizes='(max-width: 768px) 10vw, (max-width: 1200px) 5vw, 3vw'
				/>
			</div>
			<div className='flex items-center w-1/12 h-16 justify-center mx-10 gap-2'>
				<SignedOut>
					<div className='dropdown dropdown-bottom dropdown-left'>
						<button tabIndex={0} role='button' className='btn m-1'>
							Accedi
						</button>
						<div className='dropdown-content card card-compact z-[1]'>
							<div className='card-body'>
								<SignIn routing='hash' />
							</div>
						</div>
					</div>
				</SignedOut>
				<SignedIn>
					<Reports />
					<UserButton showName />
				</SignedIn>
			</div>
		</nav>
	);
};

export default Navbar;
