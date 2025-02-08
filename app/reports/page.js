"use client";
import React, { use, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useUser } from "@clerk/nextjs";
import { authorizeRole } from "../middleware/auth";
import ReportCard from "../components/ReportCard";

const page = () => {
	const { user: clerkUser } = useUser();
	const [token, setToken] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [user, setUser] = useState(null);
	const [reports, setReports] = useState(null);

	const getJWT = async () => {
		if (clerkUser) {
			const response = await fetch(`/api/authenticate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: clerkUser.emailAddresses[0]?.emailAddress,
					password: clerkUser.id,
				}),
			});

			if (!response.ok) {
				console.error("Failed to authenticate:", response.status);
				return null;
			}

			const data = await response.json(); // Parse the response
			return data.token;
		}
		return null;
	};

	useEffect(() => {
		const fetchToken = async () => {
			const jwt = await getJWT();
			setToken(jwt);

			if (jwt) {
				const req = {
					headers: new Headers({
						authorization: `Bearer ${jwt}`,
					}),
				};
				const { authorized, user } = await authorizeRole(["admin"])(req);
				setIsAdmin(authorized);
				setUser(user);
			}
		};
		fetchToken();
	}, [clerkUser]);
	useEffect(() => {
		const loadReports = async () => {
			if (!token) {
				return;
			}
			const response = await fetch(`/api/users/reports`, {
				method: "GET",
				headers: {
					authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				console.error("Failed to fetch reports:", response.status);
				return;
			}
			const data = await response.json();
			console.log("Reports:", data);
			setReports(data);
		};
		loadReports();
	}, [token]);
	return (
		<div className='flex flex-col min-h-screen bg-white'>
			<Navbar className='w-full h-[10%] z-50' />
			<div className='flex flex-col items-center justify-center w-full p-4'>
				<div className='w-full h-[10%] flex justify-center items-center'>
					<h1 className='raleway-regular'>
						{isAdmin ? "Segnalazioni" : "Le Tue Segnalazioni"}
					</h1>
				</div>
				{/* Scrollable reports container */}
				<div className='flex gap-5 flex-wrap justify-center items-center w-full max-h-[70vh] overflow-y-auto p-2'>
					{reports ? (
						reports.map((report, index) => (
							<ReportCard key={index} report={report} getJWT = {getJWT}/>
						))
					) : (
						<div className='loading loading-spinner'></div>
					)}
				</div>
			</div>
		</div>
	);

};

export default page;
