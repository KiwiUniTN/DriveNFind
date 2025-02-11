"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Navbar = dynamic(() => import("./Navbar"), { ssr: false });
const ParkingMap = dynamic(() => import("./ParkingMap"), { ssr: false });

const Wrapper = () => {
    const [spots, setSpots] = useState([]);
    const [currentQuery, setCurrentQuery] = useState(""); // Store current filter query

    useEffect(() => {
        const pollInterval = setInterval(() => {
            fetchNewSpots(currentQuery); // Use current query
        }, 5000);

        return () => {
            clearInterval(pollInterval);
        };
    }, [currentQuery]); // Add currentQuery as dependency
	const handleFilterChange = (newQuery) => {
        setCurrentQuery(newQuery);
        fetchNewSpots(newQuery);
    };
    const fetchNewSpots = async (query) => {
        try {
			//console.log(query);
            const response = await fetch(`/api/parking-spots${query ? `?${query}` : ""}`);
			//console.log('Fetching spots with URL:', response.url);
            if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
            const data = await response.json();
			//console.log('Fetched spots:', data);
            setSpots(data);
            return data;
        } catch (error) {
            console.error("Error fetching spots:", error);
        }
    };
    return (
        <div className="fixed inset-0 flex flex-col">
            <Navbar className="w-full z-50" />
            <div className="flex-1 w-full">
                <ParkingMap 
                    parkingSpots={spots} 
                    refreshSpots={handleFilterChange}
                />
            </div>
        </div>
    );
};

export default Wrapper;
