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
			setSpots(data); // Update spots based on search results
			return data;
		} catch (error) {
			console.error("Error fetching parking spots:", error);
		}
	};
	return (
		<>
			<Navbar className='h-[10%] w-screen' />
			<ParkingMap parkingSpots={spots} refreshSpots={fetchNewSpots} cardSpots={fetchNewSpots}/>
		</>
	);
};

export default Wrapper;
