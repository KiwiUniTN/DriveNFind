"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Navbar = dynamic(() => import("./Navbar"), { ssr: false });
const ParkingMap = dynamic(() => import("./ParkingMap"), { ssr: false });

const Wrapper = () => {
	const [spots, setSpots] = useState([]);

	useEffect(() => {
		const eventSource = new EventSource('/api/parking-spots/stream');
		eventSource.onmessage = (event) => {
		  const data = JSON.parse(event.data);
		  if (data.statusChanged) {
			fetchNewSpots("");
		  }
		};
	  
		return () => eventSource.close();
	  }, []);
	const fetchNewSpots = async (query) => {
		try {
			const response = await fetch(`/api/parking-spots${query ? `?${query}` : ""}`);
			if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
			const data = await response.json();
			setSpots(data);
			return data;
		} catch (error) {
			console.error("Error fetching spots:", error);
		}
	};
	return (
		<div className="fixed inset-0 flex flex-col">
			<Navbar className="w-full z-50 " />
			<div className="flex-1 w-full">
				<ParkingMap parkingSpots={spots} refreshSpots={fetchNewSpots} cardSpots={fetchNewSpots} />
			</div>
		</div>
	);
};

export default Wrapper;
