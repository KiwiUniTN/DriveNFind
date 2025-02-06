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
		setRouteActive(true);
		const routingControl = L.Routing.control({
			waypoints: [
				L.latLng(userLocation.lat, userLocation.lng),
				L.latLng(destination.lat, destination.lng),
			],
			routeWhileDragging: false,

			lineOptions: { styles: [{ color: "blue", weight: 4 }] }, // Route color
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

	// Function to remove the route manually
	const handleRemoveRoute = () => {
		if (routingControlRef.current) {
			try {
				map.removeControl(routingControlRef.current);
				routingControlRef.current = null;
				setRouteActive(false); // ✅ Update state

			} catch (error) {
				console.error("Errore nel rimuovere il routing:", error);
			}
		}
	};
	if (!routeActive) return null;

	return (
		<div
			className="leaflet-bottom leaflet-left"
			style={{ position: 'absolute', zIndex: 1000 }}
		>
			<button
				className="btn btn-accent m-4"
				onClick={handleRemoveRoute}
			>
				Rimuovi Navigazione
			</button>
		</div>
	);
};

export default RoutingMachine;
