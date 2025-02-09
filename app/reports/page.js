"use client";
import React, { use, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useUser } from "@clerk/nextjs";
import ReportCard from "../components/ReportCard";

const page = () => {
	const { user: clerkUser } = useUser();
	const [token, setToken] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [user, setUser] = useState(null);
	const [reports, setReports] = useState(null);
	const [haveReports, setHaveReports] = useState(false);

	const handleDeleteReport = (deletedReportId) => {
		setReports((prevReports) =>
			prevReports.filter((report) => report._id !== deletedReportId)
		);
	};


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
				try {
					const response = await fetch("/api/verify-role", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${jwt}`,
						},
						body: JSON.stringify(["admin"]),
					});

					const data = await response.json();
					setIsAdmin(data.authorized);
					setUser(data.user);
					console.log("User:", data.authorized);
					console.log("Role:", data.user);
				} catch (error) {
					console.error("Authorization failed:", error);
				}
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
				console.error("Failed to fetch reports:", response);
				return;
			}
			const data = await response.json();
			console.log("Reports:", data);
			setReports(data);
		};
		loadReports();
	}, [token]);
	useEffect(() => {
		if (Array.isArray(reports) && reports.length > 0) {
			setHaveReports(true);
		}
	}, [reports]);
	return (
		<div className='flex flex-col min-h-screen bg-white'>
			<Navbar className='w-full h-[10%] z-50' />
			<div className='flex flex-col items-center justify-center w-full p-4'>
				<div className='w-full h-[10%] flex justify-center items-center'>
					<h1 className='raleway-regular'>
						{isAdmin ? "Tutte le Segnalazioni" : "Le Tue Segnalazioni"}
					</h1>
				</div>
				{/* Scrollable reports container */}
				<div className='flex gap-5 flex-wrap justify-center items-center w-full max-h-[70vh] overflow-y-auto p-2'>
					{reports ? (
						haveReports ? (
							reports.map((report, index) => (
								<ReportCard
									key={index}
									report={report}
									getJWT={getJWT}
									isAdmin={isAdmin}
									onDelete = {handleDeleteReport}
								/>
							))
						) : (
							<div role='alert' className='alert alert-info'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									className='h-6 w-6 shrink-0 stroke-current'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
								</svg>
								<span>Nessuna Segnalazione Trovata</span>
							</div>
						)
					) : (
						<div className='loading loading-spinner'></div>
					)}
				</div>
			</div>
		</div>
	);
};

export default page;
