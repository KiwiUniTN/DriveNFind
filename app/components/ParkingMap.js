"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ParkCard from "./ParkCard";

const DEFAULT_POSITION = [46.067508, 11.121539]; // Trento

function LocateUser() {
	const map = useMap();

	useEffect(() => {
		if (typeof window !== "undefined" && navigator.geolocation) {
			navigator.geolocation.watchPosition(
				() => {},
				() => {
					alert(
						"Geolocalizzazione disabilitata, attivala per utilizzare quest'applicazione"
					);
				}
			);

			map.locate().on("locationfound", function (e) {
				map.setView(e.latlng, map.getZoom());
			});
		}
	}, [map]);

	return null;
}

const ParkingMap = ({ parkingSpots }) => {
	useEffect(() => {
		if (typeof window !== "undefined") {
			const L = require("leaflet");
			delete L.Icon.Default.prototype._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl:
					"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
				iconUrl:
					"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
				shadowUrl:
					"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
			});
		}
	}, []);

	return (
		<MapContainer
			center={DEFAULT_POSITION}
			zoom={13}
			scrollWheelZoom={true}
			style={{ height: "100%", width: "100%", zIndex: 0 }}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			/>
			<LocateUser />
			{parkingSpots.map((spot, index) => (
				<Marker
					key={index}
					position={[
						spot.location.coordinates[1],
						spot.location.coordinates[0],
					]}>
					<Popup>
						<ParkCard parkingLot={spot} />
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
};

export default ParkingMap;
