"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";
import { set } from "mongoose";

const RoutingMachine = ({ userLocation, destination, parkingId, parkingSpots, refreshSpots, setFreeOnly, setIsParkCardOpen, setRouteActiveParkingMap }) => {
	const map = useMap();
	const routingControlRef = useRef(null);
	const [routeActive, setRouteActive] = useState(false);
	const [showDirections, setShowDirections] = useState(false);
	const [currentDestination, setCurrentDestination] = useState(null);
	const getDistance = (coord1, coord2) => {
		const R = 6371;
		const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
		const dLon = (coord2.lng - coord1.lng) * (Math.PI / 180);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(coord1.lat * (Math.PI / 180)) *
			Math.cos(coord2.lat * (Math.PI / 180)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};
	useEffect(() => {
		//console.log("RoutingMachine ha ricevuto nuovi parkingSpots:", parkingSpots);

		if (!parkingSpots || !destination || !parkingId) {
			console.log("Dati mancanti:", { parkingSpots, destination, parkingId });
			return;
		}

		// Trova il parcheggio corrente
		const currentParkingSpot = parkingSpots.find(spot => spot._id === parkingId);
		console.log("Parcheggio corrente trovato:", currentParkingSpot);

		if (!currentParkingSpot) {
			console.log("Parcheggio non trovato nei parkingSpots");
			return;
		}

		const isOccupied = currentParkingSpot.disponibilita === 'occupato';
		console.log("Stato del parcheggio:", {
			id: parkingId,
			disponibilita: currentParkingSpot.disponibilita,
			isOccupied
		});

		if (isOccupied && userLocation) {
			console.log("Cercando parcheggio alternativo...");

			const nearestFreeParking = parkingSpots
				.filter(spot => spot.disponibilita === 'libero')
				.map(spot => ({
					...spot,
					distance: getDistance(
						{ lat: currentParkingSpot.location.coordinates[1], lng: currentParkingSpot.location.coordinates[0] },
						{ lat: spot.lat, lng: spot.lng }
					)
				}))
				.sort((a, b) => a.distance - b.distance)[0];

			console.log("Parcheggio alternativo trovato:", nearestFreeParking);

			if (nearestFreeParking) {
				console.log("Impostazione nuova destinazione", nearestFreeParking);
				if (routingControlRef.current) {
					console.log("Rimuovendo vecchio routingControl");
					map.removeControl(routingControlRef.current);
				}
				setCurrentDestination({
					lat: nearestFreeParking.location.coordinates[1],
					lng: nearestFreeParking.location.coordinates[0],
					id: nearestFreeParking._id
				});
			}
		}
	}, [parkingSpots, destination, userLocation, parkingId]);
	useEffect(() => {
		if (!map || !userLocation || !(destination || currentDestination)) return;
		const L = require("leaflet");
		// Use currentDestination if available, otherwise fall back to destination

		const targetDestination = currentDestination || destination;
		console.log("Target destination:", targetDestination);
		setRouteActive(true);
		setRouteActiveParkingMap(true);

		const routingControl = L.Routing.control({
			waypoints: [
				L.latLng(userLocation.lat, userLocation.lng),
				L.latLng(targetDestination.lat, targetDestination.lng),
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
			},

		}).addTo(map);

		setIsParkCardOpen(true);
		routingControlRef.current = routingControl;

		
	}, [map, userLocation, destination, currentDestination]); // Add currentDestination to dependencies


	const handleRemoveRoute = async () => {
		if (routingControlRef.current) {
			const currentSpot = parkingSpots.find(spot => spot._id === parkingId);
			console.log("Current spot:", currentSpot);
			try {
				map.removeControl(routingControlRef.current);
				routingControlRef.current = null;
				setRouteActive(false);
				if (currentDestination == null || currentDestination != destination) {
					const response = await fetch(`/api/parking-spots?id=${parkingId}&disponibilita=libero`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json'
						}
					});
					if (!response.ok) {
						throw new Error('Failed to update parking spot status');
					}
				}
				setRouteActiveParkingMap(false);

				refreshSpots();
			} catch (error) {
				console.error("Error while removing route:", error);
			}
			console.log(destination, currentDestination)
			if (destination != currentDestination) {
				console.log("entro")
				setCurrentDestination(null);
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
				<div className='fixed w-full flex-wrap justify-center bottom-8 flex gap-2  z-[1000] sm:left-8'>
					<button
						className="-semibold btn btn-xs text-white bg-[#ad181a] border-none sm:btn-sm  z-10 h-auto flex items-center hover:bg-slate-900 min-w-[100px]"
						onClick={() => {
							setFreeOnly(false);
							handleRemoveRoute();
						}}
					>
						ESCI DALLA NAVIGAZIONE
					</button>

					<button
						onClick={() => setShowDirections(!showDirections)}
						className='poppins-semibold btn btn-xs text-white bg-[#ad181a] border-none sm:btn-sm  z-10 h-auto flex items-center hover:bg-slate-900 min-w-[100px]'>
						{showDirections ? "RIMUOVI " : "MOSTRA"} INDICAZIONI
					</button>
				</div >
			)}
		</>
	);
};

export default RoutingMachine;