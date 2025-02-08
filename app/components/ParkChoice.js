import React, { useEffect } from "react";
import { useState } from "react";



const ParkChoice = ({ data, destination }) => {
	console.log("Opzioni", data);
	const [showOptions, setShowOptions] = useState(true);
	useEffect(() => {
		// se i dati cambiano mostro le nuove opzioni 
		console.log("opzioni", data);
		setShowOptions(true);
	}, [data]);
	return (
		<>
			<div className="fixed left-1/2 top-1/2 mt-[33vh] -translate-x-1/2 -translate-y-1/2 z-10">
				{showOptions ? (
					<div className='carousel carousel-center  rounded-box max-w-2xl space-x-4 p-4'>
						{data.map((park, index) => (
							<div key={index} className='carousel-item'>
								<div className='card bg-white shadow-xl'>
									<div className='card-body'>
										<div className='flex justify-between gap-8'>
											<h2 className='card-title poppins-semibold'>{park.nome.toUpperCase()}</h2>
											<button
												className="btn btn-xs text-white bg-[#ad181a] border-none sm:btn-sm md:btn-md lg:btn-lg z-10"
												onClick={async ()=> {
													setShowOptions(false);
													try {
														const response = await fetch(`/api/parking-spots?id=${park._id}&disponibilita=navigazione`, {
															method: 'PATCH',
															headers: {
																'Content-Type': 'application/json'
															}
														});
			
														if (!response.ok) {
															throw new Error('Failed to update parking spot');
														}
			
														// If the PATCH was successful, then update the destination
														destination({
															lat: park.location.coordinates[1],
															lng: park.location.coordinates[0],
															id: park._id
														});
													} catch (error) {
														console.error('Error updating parking spot:', error);
														// You might want to show an error message to the user here
													}
												}}>
												NAVIGA
											</button>
										</div>

										<div>
											<div className='flex gap-3'>
												<span className="raleway-semibold">Indirizzo:</span>
												<span className="raleway-regular">{park.indirizzo.charAt(0).toUpperCase()+park.indirizzo.slice(1)}</span>
											</div>
											<div className='flex gap-3'>
												<span className="raleway-semibold">Distanza dalla destinazione:</span>
												<span className="raleway-regular">{parseInt(park.distance)} mt</span>
											</div>
											<div className='flex gap-3'>
												<span className="raleway-semibold">Alimentazione:</span>
												<span className="raleway-regular">{park.alimentazione}</span>
											</div>
											<div className='flex gap-3'>
												<span className="raleway-semibold">Tipologia:</span>
												<span className="raleway-regular">{park.tipologia}</span>
											</div>
											<div className='flex gap-3'>
												<span className="raleway-semibold">Regolamento:</span>
												<span className="raleway-regular">{park.regolamento}</span>
											</div>
											<div className='flex gap-3'>
												<span className="raleway-semibold">{park.disabili ? "Parcheggio giallo per disabili" : "Parcheggio normale"}</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : null}
			</div>
		</>
	);
};

export default ParkChoice;
