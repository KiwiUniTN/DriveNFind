"use client";
import { useEffect } from "react";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

const RoutingMachine = ({ userLocation, destination }) => {
	console.log("RoutingMachine is being rendered...");
	console.log("userLocation:", userLocation);
	console.log("destination:", destination);

	const map = useMap();

	useEffect(() => {
		if (!map || !userLocation || !destination) return;

		const L = require("leaflet");

		const routingControl = L.Routing.control({
			waypoints: [
				L.latLng(userLocation.lat, userLocation.lng),
				L.latLng(destination.lat, destination.lng),
			],
			routeWhileDragging: true,
			lineOptions: {
				styles: [{ color: "blue", weight: 4 }],
			},
		}).addTo(map);

		return () => map.removeControl(routingControl);
	}, [map, userLocation, destination]);

	return null;
};

export default RoutingMachine;
