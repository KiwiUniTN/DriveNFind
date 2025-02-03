import React, { useEffect } from "react";
import { useState } from "react";

const ParkChoice = ({ data, destination }) => {
	console.log("opzioni", data);
	const [showOptions, setShowOptions] = useState(true);
	useEffect(() => {
		// se i dati cambiano mostro le nuove opzioni 
		console.log("opzioni", data);
		setShowOptions(true);
	}, [data]);
	return (
		<>
		{showOptions ? (	
		<div className='carousel carousel-center  rounded-box max-w-2xl space-x-4 p-4'>
			{data.map((park, index) => (
				<div key={index} className='carousel-item'>
					<div className='card bg-base-100  shadow-xl'>
						<div className='card-body'>
							<div className='flex justify-between gap-8'>
								<h2 className='card-title'>{park.nome}</h2>
								<button
									className='btn btn-xs sm:btn-sm md:btn-md lg:btn-lg z-10'
									onClick={() => {
										setShowOptions(false);	
										destination({
											lat: park.location.coordinates[1],
											lng: park.location.coordinates[0],
										});
									}}>
									Naviga
								</button>
							</div>

							<div>
								<div className='flex gap-3'>
									<span>Indirizzo:</span>
									<span>{park.indirizzo}</span>
								</div>
								<div className='flex gap-3'>
									<span>Distanza:</span>
									<span>{parseInt(park.distance)} mt</span>
								</div>
								<div className='flex gap-3'>
									<span>Disponibilità:</span>
									<span>{park.disponibilita}</span>
								</div>
								<div className='flex gap-3'>
									<span>Alimentazione:</span>
									<span>{park.alimentazione}</span>
								</div>
								<div className='flex gap-3'>
									<span>Tipologia:</span>
									<span>{park.tipologia}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
		) : null}
		</>
	);
};

export default ParkChoice;
