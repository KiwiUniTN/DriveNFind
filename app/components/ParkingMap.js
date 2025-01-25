"use client";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMapEvent,
	useMapEvents,
	useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import ParkCard from "./ParkCard";



/**
 * @typedef {Object} Location
 * @property {string} type - The type of the location, e.g., "Point".
 * @property {number[]} coordinates - An array with longitude and latitude values.
 */

/**
 * @typedef {Object} ParkingLot
 * @property {Location} location - Geographical location of the parking lot.
 * @property {string} _id - Unique identifier of the parking lot.
 * @property {string} nome - Name of the parking lot.
 * @property {string} indirizzo - Address of the parking lot.
 * @property {string} tipologia - Type of parking (e.g., "coperto", "scoperto").
 * @property {string} regolamento - Parking rules (e.g., "pagamento", "gratuito").
 * @property {string} link - URL with more details.
 * @property {string} alimentazione - Type of fuel supported (e.g., "carburante", "elettrico").
 * @property {boolean} disabile - Whether the parking is disabled-friendly.
 * @property {string} disponibilita - Availability status (e.g., "libero", "occupato").
 */

/**
 * @type {ParkingLot[]}
 */

// Configure Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
const DEFAULT_POSITION = [46.067508, 11.121539]; // Trento
function LocateUser() {
	// Controllo che l'utente abbia attivato la geolocalizzazione
	navigator.geolocation.watchPosition(() => {}, () => {
		alert("Geolocalizzazione disabilitata, attivala per utilizzare quest'applicazione");
		return null; });
	
	const map = useMap();
	useEffect(() => {
	map.locate().on("locationfound", function (e) {
		map.setView(e.latlng, map.getZoom());
	});
}, [map]);	return null;
}


const ParkingMap = ({ parkingSpots , data = [] }) => {
	console.log("in component" ,parkingSpots);
	return (
		<MapContainer
			key={JSON.stringify(data)}
			center={DEFAULT_POSITION}
			zoom={13}
			scrollWheelZoom={true}
			style={{ height: "100%", width: "100%", zIndex: 0 }}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			/>
			<LocateUser />
			{parkingSpots.map((spot, index) => {
				return (
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
				);
			})}
		</MapContainer>
	);
};

export default ParkingMap;
