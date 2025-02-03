"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

const RoutingMachine = ({ userLocation, destination }) => {
	console.log("RoutingMachine is being rendered...");
	console.log("userLocation:", userLocation);
	console.log("destination:", destination);

	const map = useMap();
	const routingControlRef = useRef(null);
	const [routeActive, setRouteActive] = useState(false);

	useEffect(() => {
		if (!map || !userLocation || !destination) return;

		const L = require("leaflet");

		// Creazione del controllo di routing
		const routingControl = L.Routing.control({
			waypoints: [
				L.latLng(userLocation.lat, userLocation.lng),
				L.latLng(destination.lat, destination.lng),
			],
			routeWhileDragging: true,
			lineOptions: {
				styles: [{ color: "blue", weight: 4 }],
			},
			router: L.Routing.osrmv1({
				serviceUrl: "https://router.project-osrm.org/route/v1",
				language: "it", // Lingua italiana
			}),
		}).addTo(map);

		// Salva l'istanza del routing control
		routingControlRef.current = routingControl;
		setRouteActive(true);

		return () => {
			if (routingControlRef.current) {
				try {
					map.removeControl(routingControlRef.current);
					routingControlRef.current = null;
					setRouteActive(false);
				} catch (error) {
					console.error("Errore nel cleanup del routing:", error);
				}
			}
		};
	}, [map, userLocation, destination]);

	// Funzione per rimuovere manualmente il percorso
	const handleRemoveRoute = () => {
		if (routingControlRef.current) {
			try {
				map.removeControl(routingControlRef.current);
				routingControlRef.current = null;
				setRouteActive(false);
			} catch (error) {
				console.error("Errore nel rimuovere il routing:", error);
			}
		}
	};

	return (
		<>
			{routeActive && (
				<button
					className='absolutebtn btn-accent left-5 bottom-4'
					style={{ zIndex: 999 }}
					onClick={handleRemoveRoute}>
					Rimuovi Navigazione
				</button>
			)}
		</>
	);
};

export default RoutingMachine;
