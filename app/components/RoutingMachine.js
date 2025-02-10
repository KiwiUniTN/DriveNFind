"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";
import { set } from "mongoose";

const RoutingMachine = ({ userLocation, destination, parkingId, refreshSpots }) => {
	const map = useMap();
	const routingControlRef = useRef(null);
	const [routeActive, setRouteActive] = useState(false);
	const [showDirections, setShowDirections] = useState(false);

	useEffect(() => {
		if (!map || !userLocation || !destination) return;
		const L = require("leaflet");
		setRouteActive(true);

		const routingControl = L.Routing.control({
			waypoints: [
				L.latLng(userLocation.lat, userLocation.lng),
				L.latLng(destination.lat, destination.lng),
			],
			routeWhileDragging: false,
			lineOptions: { styles: [{ color: "blue", weight: 4 }] },
			router: L.Routing.osrmv1({
				serviceUrl: "https://router.project-osrm.org/route/v1",
				showAlternatives: true,
				fitSelectedRoutes: true,
				show: true,
				collapsible: true,
				language: "it",
			}),
			createMarker: function (i, waypoint, n) {
				const marker = L.marker(waypoint.latLng, {
					icon: L.icon({
						iconUrl: 'OrangeMarker.png',
						iconSize: [19, 27],
						iconAnchor: [10, 27],
						popupAnchor: [0, -27]
					})
				});
				return marker;
			}
		}).addTo(map);

		routingControlRef.current = routingControl;

		return () => {
			if (routingControlRef.current) {
				map.removeControl(routingControlRef.current);
			}
		};
	}, [map, userLocation, destination]);

	const handleRemoveRoute = async () => {
		if (routingControlRef.current) {
			try {
				map.removeControl(routingControlRef.current);
				routingControlRef.current = null;
				setRouteActive(false);
				const response = await fetch(`/api/parking-spots?id=${parkingId}&disponibilita=libero`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					}
				});
				
				if (!response.ok) {
					throw new Error('Failed to update parking spot status');
				}
				refreshSpots();
			} catch (error) {
				console.error("Error while removing route:", error);
			}
		}
	};

	return (
		<>
			<style>
				{`
				.leaflet-routing-container {
					display: ${showDirections ? "block" : "none"};
				}
			`}
			</style>
			{routeActive && (
				<div className='fixed bottom-8 flex gap-2 left-8 z-[1000]'>
					<button
						className='poppins-semibold btn btn-xs text-white bg-[#ad181a] border-none sm:btn-sm md:btn-md lg:btn-lg z-10 h-auto flex items-center hover:bg-slate-900 min-w-[100px]'
						onClick={handleRemoveRoute}>
						ESCI DALLA NAVIGAZIONE
					</button>
					<button
						onClick={() => setShowDirections(!showDirections)}
						className='poppins-semibold btn btn-xs text-white bg-[#ad181a] border-none sm:btn-sm md:btn-md lg:btn-lg z-10 h-auto flex items-center hover:bg-slate-900 min-w-[100px]'>
						{showDirections ? "RIMUOVI " : "MOSTRA"} INDICAZIONI
					</button>
				</div>
			)}
		</>
	);
};

export default RoutingMachine;