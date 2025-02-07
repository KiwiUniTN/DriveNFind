"use client";
import { use, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ReportModal from "./ReportModal";
import { useAuth, useUser } from "@clerk/nextjs";
import SearchBar from "./SearchBar";
import ParkCard from "./ParkCard";
import RoutingMachine from "./RoutingMachine";
import ParkChoice from "./ParkChoice";

const DEFAULT_POSITION = [46.067508, 11.121539]; // Trento

function LocateUser({ setUserLocation, setError }) {
	const map = useMap();

	useEffect(() => {
		if (typeof window !== "undefined" && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					setUserLocation({ lat: latitude, lng: longitude });
					map.setView([latitude, longitude], 13);
				},
				() => {
					setError(
						"Geolocalizzazione disattivata o mancata autorizzazione. Attivala per utilizzare l'applicazione."
					);
					map.setView(DEFAULT_POSITION, 13);
				}
			);
		}
	}, [map, setUserLocation, setError]);

	return null;
}
var LeafIcon = L.Icon.extend({
	options: {
		iconSize: [19, 27],
		iconAnchor: [10, 27],
		popupAnchor: [0, -27],
	},
});
var greenIcon = new LeafIcon({ iconUrl: "GreenMarker.png" }),
	redIcon = new LeafIcon({ iconUrl: "RedMarker.png" }),
	orangeIcon = new LeafIcon({ iconUrl: "OrangeMarker.png" });

const ParkingMap = ({ parkingSpots = [], refreshSpots }) => {
	const [errorLogin, setErrorLogin] = useState(null);
	const { isSignedIn } = useAuth();
	const [showAlertNoPark, setShowAlertNoPark] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [error, setError] = useState(null);
	const [spots, setSpots] = useState(parkingSpots);
	const [userLocation, setUserLocation] = useState(null);
	const [destination, setDestination] = useState(null);
	const [parkingOption, setParkingOption] = useState(null);
	const { user } = useUser();

	const handleReportSubmit = async (parkData) => {
		console.log("Report Data:", parkData);

		// get token for the user
		const response = await fetch(`/api/authenticate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: user.emailAddresses[0]?.emailAddress,
				password: user.id, 
			}),
		});

		if (!response.ok) {
			console.error("Failed to authenticate:", response.status);
			return;
		}

		const data = await response.json(); // Parse the response
		const token = data.token;
		console.log("Token:", token);
		// Send data to API or handle submission
		fetch(`/api/users/baseusers/reports`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				parkingLotId: parkData.lotId,
				description: parkData.description,
				imageUrl: parkData.imageUrl,
			}),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to submit report");
				}
				return response.json();
			})
			.then((data) => {
				console.log("Report submitted successfully:", data);
				setIsModalOpen(false);
			})
			.catch((error) => {
				console.error("Error submitting report:", error);
				// You might want to show an error message to the user here
			});
	};
	useEffect(() => {
		setSpots(parkingSpots);
	}, [parkingSpots]);
	useEffect(() => {
		if (Array.isArray(parkingOption) && parkingOption.length === 0) {
			setShowAlertNoPark(true);
		} else {
			setShowAlertNoPark(false);
		}
	}, [parkingOption]); // Runs when parkingOption changes

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
				<LocateUser setUserLocation={setUserLocation} setError={setError} />
				{/* Marker Parcheggi */}
				{!error &&
					parkingSpots.map((spot, index) => (
						<Marker
							key={index}
							position={[
								spot.location.coordinates[1],
								spot.location.coordinates[0],
							]}
							icon={
								spot.disponibilita === "navigazione"
									? orangeIcon
									: spot.disponibilita === "libero"
									? greenIcon
									: redIcon
							}>
							<Popup>
								<ParkCard parkingLot={spot} />
								{spot.disponibilita === "libero" ? (
									<button
										onClick={async () => {
											console.log("Naviga to:", spot._id);
											try {
												const response = await fetch(
													`/api/parking-spots?id=${spot._id}&disponibilita=navigazione`,
													{
														method: "PATCH",
														headers: {
															"Content-Type": "application/json",
														},
													}
												);

												if (!response.ok) {
													throw new Error("Failed to update parking spot");
												}

												// If the PATCH was successful, then update the destination
												setDestination({
													lat: spot.location.coordinates[1],
													lng: spot.location.coordinates[0],
													id: spot._id,
												});
											} catch (error) {
												console.error("Error updating parking spot:", error);
												// You might want to show an error message to the user here
											}
										}}
										className='text-blue-600 underline raleway-semibold'>
										NAVIGA
									</button>
								) : spot.disponibilita === "occupato" ? (
									<>
										<button
											onClick={() => {
												if (!isSignedIn) {
													setErrorLogin(
														"Devi aver fatto l'accesso per segnalare un parcheggio."
													);
												} else {
													setIsModalOpen(true);
												}
											}}
											className='text-red-600 underline raleway-semibold'>
											SEGNALA
										</button>
										<ReportModal
											isOpen={isModalOpen}
											onClose={() => setIsModalOpen(false)}
											onSubmit={handleReportSubmit}
											parkId={spot._id}
										/>

										{/* Messaggio di errore visibile solo se c'è un errore */}
										{errorLogin && (
											<div
												role='alert'
												className='alert alert-error p-2 text-sm flex items-center gap-2 mt-2'>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='h-4 w-4 shrink-0 stroke-current'
													fill='none'
													viewBox='0 0 24 24'>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth='2'
														d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
													/>
												</svg>
												<span className='raleway-regular'>{errorLogin}</span>
											</div>
										)}
									</>
								) : null}
							</Popup>
						</Marker>
					))}
				{/* Routing Machine */}
				{userLocation && destination && (
					<div className='directions-container'>
						<RoutingMachine
							userLocation={userLocation}
							destination={destination}
							parkingId={destination.id}
							refreshSpots={refreshSpots}
						/>
					</div>
				)}
			</MapContainer>
			<div className='absolute top-2 left-16 z-[1]'>
				<SearchBar
					refreshSpots={refreshSpots}
					position={DEFAULT_POSITION}
					cardSpots={setParkingOption}
				/>
			</div>
			{Array.isArray(parkingOption) &&
			parkingOption != null &&
			parkingOption.length > 0 ? (
				<div className='absolute mb-4'>
					<ParkChoice data={parkingOption} destination={setDestination} />
				</div>
			) : showAlertNoPark ? (
				<div className='fixed top-[12%] left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md'>
					<div
						role='alert'
						className='alert alert-error p-2 text-sm flex items-center gap-2'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-4 w-4 shrink-0 stroke-current'
							fill='none'
							viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
							/>
						</svg>
						<span className='raleway-regular'>
							Nessun parcheggio libero in un raggio di 1 km dalla destinazione
						</span>
					</div>
				</div>
			) : null}
			{error && (
				<div
					role='alert'
					className='alert alert-error p-2 text-sm flex items-center gap-2'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-4 w-4 shrink-0 stroke-current'
						fill='none'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
						/>
					</svg>
					<span className='raleway-regular'>{error}</span>
				</div>
			)}
		</div>
	);
};

export default ParkingMap;
