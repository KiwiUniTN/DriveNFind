'use client';
import React from "react";
import Image from "next/image";
import { SignedIn, SignedOut, SignIn, SignInButton, UserButton } from "@clerk/nextjs";




const Navbar = ({ className }) => {
	return (
		<nav
			className={`${className} flex flex-wrap p-1 justify-between align-middle `}>
			<div className='relative w-1/12 h-16'>
				<Image
					src='/LogoDriveNFind.png'
					alt='Logo'
					fill
					className='object-contain'
					sizes='(max-width: 768px) 10vw, (max-width: 1200px) 5vw, 3vw'
				/>
			</div>
			<div className='flex justify-center items-center w-1/12 h-16'>
				<SignedOut> 
					<div className='dropdown dropdown-bottom dropdown-left'>
						<div tabIndex={0} role='button' className='btn m-1'>
							Accedi
						</div>
						<div
							tabIndex={0}
							className='dropdown-content card card-compact  z-[1]  shadow'>
							<div className='card-body'>
								<SignIn routing="hash" />
							</div>
						</div>
					</div>
				</SignedOut>
				<SignedIn>
					<UserButton  showName/>
				</SignedIn>
			</div>
		</nav>
	);
};

export default Navbar;
