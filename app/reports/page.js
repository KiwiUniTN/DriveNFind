"use client";
import React, { use, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useUser } from "@clerk/nextjs";
import ReportCard from "../components/ReportCard";
import { faFileContract, faEarthAmericas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const page = () => {
	const { user: clerkUser } = useUser();
	const [token, setToken] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [user, setUser] = useState(null);
	const [reports, setReports] = useState(null);
	const [haveReports, setHaveReports] = useState(false);
	const [parkingSpots, setParkingSpots] = useState({});

	const handleDeleteReport = (deletedReportId) => {
		setReports((prevReports) =>
			prevReports.filter((report) => report._id !== deletedReportId)
		);
	};
	useEffect(() => {
		const fetchParkingSpotDetails = async () => {
			try {
				const response = await fetch(`/api/parking-spots`);
				if (!response.ok) {
					throw new Error('Failed to fetch parking spots');
				}
				const data = await response.json();
				console.log("Fetched parking spots:", data);
	
				// Convert array to object for quick lookup
				const parkingSpotMap = data.reduce((acc, spot) => {
					acc[spot._id] = spot;
					return acc;
				}, {});
	
				setParkingSpots(parkingSpotMap);
			} catch (error) {
				console.error(`Error fetching parking spots`, error);
			}
		};
	
		fetchParkingSpotDetails();
	}, []); // Runs once when the component mounts
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
            if (!token) return;

            try {
                const response = await fetch(`/api/users/reports`, {
                    method: "GET",
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch reports");
                }

                const data = await response.json();
                setReports(data);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            }
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
				<div className='w-full h-[10%] justify-center items-center flex gap-2'>
					<h1 className='poppins-semibold text-3xl '>
						{isAdmin ? "TUTTE LE SEGNALAZIONI SUL TERRITORIO" : "LE TUE SEGNALAZIONI"}
					</h1>
					{!isAdmin ? <FontAwesomeIcon icon={faFileContract} /> : <FontAwesomeIcon icon={faEarthAmericas} />}
				</div>
				{/* Scrollable reports container */}

				<div className='flex gap-5 flex-wrap justify-center items-center w-full max-h-[70vh] overflow-y-auto p-2'>
					{reports ? (
						haveReports ? (
							reports.map((report, index) => (
								<ReportCard
									key={index}
									report={report}
									parkingSpot={parkingSpots[report.parkingLotId]}
									getJWT={getJWT}
									isAdmin={isAdmin}
									onDelete={handleDeleteReport}
								/>
							))
						) : (
							<div className='fixed top-2/4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md'>
								<div
									role='alert'
									className='alert alert-error p-2 text-sm flex items-center gap-2'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-4 w-4 shrink-0 stroke-current'
										fill='none'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
									<span className='raleway-regular'>Nessuna segnalazione trovata</span>
								</div>
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
