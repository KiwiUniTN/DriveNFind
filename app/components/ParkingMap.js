"use client";
import { use, useEffect,useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SearchBar from "./SearchBar";	
import ParkCard from "./ParkCard";
import RoutingMachine from "./RoutingMachine";
import ParkChoice from "./ParkChoice";

const DEFAULT_POSITION = [46.067508, 11.121539]; // Trento

function LocateUser({ setUserLocation }) {
	const map = useMap();

	useEffect(() => {
		if (typeof window !== "undefined" && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					setUserLocation({ lat: latitude, lng: longitude }); // ✅ Store user location
					map.setView([latitude, longitude], 13);
				},
				() => {
					alert(
						"Geolocalizzazione disabilitata, attivala per utilizzare quest'applicazione"
					);
				}
			);
		}
	}, [map, setUserLocation]);

	return null;
}


const ParkingMap = ({ parkingSpots =[], refreshSpots ,cardSpots}) => {
	const [spots, setSpots] = useState(parkingSpots);
	const [userLocation, setUserLocation] = useState(null);
	const [destination, setDestination] = useState(null);
	const [parkingOption, setParkingOption] = useState(null);
	

	useEffect(() => {
		setSpots(parkingSpots);
	}, [parkingSpots]);

	useEffect(() => {
		console.log("Da visualizzare in modo decente", parkingOption);
	}, [parkingOption]);

	
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
		<div className='relative w-screen h-screen  flex flex-col justify-end items-center'>
			<MapContainer
				center={DEFAULT_POSITION}
				zoom={13}
				scrollWheelZoom={true}
				style={{ height: "100%", width: "100%", zIndex: 0 }}>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>
				{/* Posizione Utente */}
				<LocateUser setUserLocation={setUserLocation} />
				{/* Marker Parcheggi */}
				{parkingSpots.map((spot, index) => (
					<Marker
						key={index}
						position={[
							spot.location.coordinates[1],
							spot.location.coordinates[0],
						]}>
						<Popup>
							<ParkCard parkingLot={spot} />
							<button
								onClick={() =>
									setDestination({
										lat: spot.location.coordinates[1],
										lng: spot.location.coordinates[0],
									})
								}
								className='text-blue-600 underline'>
								Naviga
							</button>
						</Popup>
					</Marker>
				))}
				{/* Routing Machine */}
				{userLocation && destination && (
					<RoutingMachine
						userLocation={userLocation}
						destination={destination}
					/>
				)}
			</MapContainer>
			<div className='absolute top-2 left-16 z-[1]'>
				<SearchBar
					refreshSpots={refreshSpots}
					position={DEFAULT_POSITION}
					cardSpots={setParkingOption}
				/>
			</div>
			{Array.isArray(parkingOption) && parkingOption.length > 0 ? (
				<div className='absolute mb-4'>
					<ParkChoice data={parkingOption} destination={setDestination} />
				</div>
			) : null}
		</div>
	);
};

export default ParkingMap;
