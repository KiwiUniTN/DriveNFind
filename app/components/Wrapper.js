"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Navbar = dynamic(() => import("./Navbar"), { ssr: false });
const ParkingMap = dynamic(() => import("./ParkingMap"), { ssr: false });

const Wrapper = ({ prevSpots }) => {
	const [spots, setSpots] = useState(prevSpots || []);

	useEffect(() => {
		if (prevSpots !== undefined) {
			setSpots(prevSpots);
		}
	}, [prevSpots]);

	const fetchNewSpots = async (query) => {
		try {
			const response = await fetch(`/api/parking-spots?${query}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.statusText}`);
			}
			const data = await response.json();
			console.log("Fetched parking spots:", data);
			setSpots(data); // Update spots based on search results
			return data;
		} catch (error) {
			console.error("Error fetching parking spots:", error);
		}
	};
	return (
		<div className="fixed inset-0 flex flex-col">
			<Navbar className="w-full h-[10%] z-50 bg-[#ffffe3]" />
			<div className="flex-1 w-full">
				<ParkingMap parkingSpots={spots} refreshSpots={fetchNewSpots} cardSpots={fetchNewSpots} />
			</div>
		</div>
	);
};

export default Wrapper;
