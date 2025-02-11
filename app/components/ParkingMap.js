"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ReportModal from "./ReportModal";
import { useAuth, useUser } from "@clerk/nextjs";
import SearchBar from "./SearchBar";
import ParkCard from "./ParkCard";
import RoutingMachine from "./RoutingMachine";
import ParkChoice from "./ParkChoice";
import { set } from "mongoose";

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

const ParkingMap = ({ parkingSpots, refreshSpots }) => {
	const [suggestions, setSuggestions] = useState([""]);
	const [errorLogin, setErrorLogin] = useState(null);
	const { isSignedIn } = useAuth();
	const [showAlertNoPark, setShowAlertNoPark] = useState(false);
	const [isParkCardOpen, setIsParkCardOpen] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [error, setError] = useState(null);
	const [userLocation, setUserLocation] = useState(null);
	const [destination, setDestination] = useState(null);
	const [parkingOption, setParkingOption] = useState(null);
	const { user } = useUser();
	const [freeOnly, setFreeOnly] = useState(true);
	const [routeActiveParkingMap, setRouteActiveParkingMap] = useState(false);
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
		console.log("imageFile:", parkData);
		const formData = new FormData();
		formData.append("parkingLotId", parkData.lotId);
		formData.append("description", parkData.description);
		formData.append("image", parkData.image);
		console.log("Image File prova:", parkData.image);
		// Send data to API or handle submission
		fetch(`/api/users/baseusers/reports`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
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
		if (Array.isArray(parkingOption) && parkingOption.length === 0) {

			setShowAlertNoPark(true);
		} else {

			setShowAlertNoPark(false);
		}
	}, [parkingOption]);
	// useEffect(() => {
	// 	console.log("ParkingMap ha ricevuto nuovi parkingSpots:", parkingSpots);
	// }, [parkingSpots]);
	return (
		<div className='relative w-screen h-screen flex flex-col justify-end'>
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
				{parkingSpots.map((spot, index) => (
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
						{isParkCardOpen ?
							<Popup>
								<ParkCard parkingLot={spot} isOpen={isParkCardOpen} />
								{spot.disponibilita === "libero" && !error ? (
									routeActiveParkingMap ? (
										<p className='text-red-600 poppins-semibold'>
											Per favore, esci dalla navigazione attualmente attiva per poter navigare verso un altro parcheggio.
										</p>
									) : (
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
													// Se il PATCH ha successo, aggiorna la destinazione
													setIsParkCardOpen(false);
													setDestination({
														lat: spot.location.coordinates[1],
														lng: spot.location.coordinates[0],
														id: spot._id,
													});
												} catch (error) {
													console.error("Error updating parking spot:", error);
												}
											}}
											className='text-blue-600 underline raleway-semibold'>
											NAVIGA
										</button>
									)
								) : spot.disponibilita === "occupato" ? (
									<>
										
										<button
											onClick={() => {
												if (!isSignedIn) {
													setErrorLogin("Devi aver fatto l'accesso per segnalare un parcheggio.");
												} else {
													setIsModalOpen(true);
												}
											}}
											className='text-red-600 underline raleway-semibold'>
											SEGNALA
										</button>

										{isSignedIn && (
											<ReportModal
												isOpen={isModalOpen}
												onClose={() => setIsModalOpen(false)}
												onSubmit={handleReportSubmit}
												parkId={spot._id}
											/>
										)}

										{/* Messaggio di errore solo per parcheggi occupati */}
										{errorLogin && (
											<div
												role='alert'
												className='alert alert-error p-2 text-sm flex items-center gap-2 mt-2 bg-[#ad181a] text-white'>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='h-4 w-4 shrink-0 stroke-current'
													fill='none'
													viewBox='0 0 24 24'>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth='2'
														d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
													/>
												</svg>
												<span className='raleway-regular'>{errorLogin}</span>
											</div>
										)}
									</>
								) : null}
							</Popup> : null
						}

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
							parkingSpots={parkingSpots}
							setFreeOnly={setFreeOnly}
							setIsParkCardOpen={setIsParkCardOpen}
							setRouteActiveParkingMap={setRouteActiveParkingMap}
						/>
					</div>
				)}
			</MapContainer>
			<div className='absolute top-2 left-16 z-[1]'>
				{!error && userLocation && !routeActiveParkingMap ?
					<SearchBar
						refreshSpots={refreshSpots}
						position={DEFAULT_POSITION}
						cardSpots={setParkingOption}
						freeOnly={freeOnly}
						setFreeOnly={setFreeOnly}
						setSuggestionsPerAlert={setSuggestions}
					/> : null
				}
			</div>
			{Array.isArray(parkingOption) &&
				parkingOption != null &&
				parkingOption.length > 0 ? (

				<ParkChoice data={parkingOption} destination={setDestination} />

			) : showAlertNoPark ? (
				<div className='fixed top-[12%] left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md'>
					<div
						role='alert'
						className='alert alert-error p-2 text-sm flex items-center gap-2 bg-[#ad181a] text-white'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-4 w-4 shrink-0 stroke-current'
							fill='none'
							viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
							/>
						</svg>
						<span className='raleway-regular'>
							Nessun parcheggio libero in un raggio di 1 km dalla destinazione
						</span>
					</div>
				</div>
			) : null}
			{error ? (
				<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
					<div
						role='alert'
						className='alert alert-error p-2 text-sm flex justify-center  gap-2 bg-[#ad181a] text-white'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-4 w-4 shrink-0 stroke-current'
							fill='none'
							viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
							/>
						</svg>
						<span className='raleway-regular'>{error}</span>
					</div>
				</div>
			) : null}
			{suggestions.length == 0 && (
				<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
					<div
						role='alert'
						className='alert alert-error p-2 text-sm flex justify-center  gap-2 bg-[#ad181a] text-white'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-4 w-4 shrink-0 stroke-current'
							fill='none'
							viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
							/>
						</svg>
						<span className='raleway-regular'>La destinazione inserita è invalida!</span>
					</div>
				</div>
			)}
			{parkingSpots.length == 0 && !error ? (
				<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
					<div
						role='alert'
						className='alert alert-error p-2 text-sm flex justify-center  gap-2 bg-[#ad181a] text-white'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-4 w-4 shrink-0 stroke-current'
							fill='none'
							viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
							/>
						</svg>
						<span className='raleway-regular'>Nessun parcheggio trovato che rispetta i criteri di ricerca!</span>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default ParkingMap;
