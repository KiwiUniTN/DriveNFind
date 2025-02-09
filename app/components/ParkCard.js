import React from 'react'

/**
 * @param {{ parkingLot: parkingLot }} props
 */


const ParkCard = ({ parkingLot }) => {
	return (
		<div className='p-2'>
			<div className='poppins-semibold'>{parkingLot.nome.toUpperCase()}</div>
			<div className='raleway-semibold'>
				
				{parkingLot.disponibilita == "navigazione" ? (
					<div className='flex flex-col justify-center items-center' >
					<p className='text-xl text-red-600'>
						Parcheggio Prenotato da un altro utente!
					</p>
					<div className="raleway-regualer italic">Non è possibile Navigare</div>
					</div>
					
				) : (
					<>
					Disponiilità : 
					<span className='raleway-regular'>{parkingLot.disponibilita}</span>
					</>
				)}
			</div>
			<div className='raleway-semibold'>
				Tipologia:{" "}
				<span className='raleway-regular'>{parkingLot.tipologia}</span>
			</div>
			<div className='raleway-semibold'>
				Regolamento:{" "}
				<span className='raleway-regular'>{parkingLot.regolamento}</span>
			</div>
			<div className='raleway-semibold'>
				Parcheggio giallo per disabili:{" "}
				<span className='raleway-regular'>
					{parkingLot.disabile ? "Sì" : "No"}
				</span>
			</div>
			<div className='raleway-semibold'>
				Alimentazione:{" "}
				<span className='raleway-regular'>{parkingLot.alimentazione}</span>
			</div>
			<div className='raleway-semibold'>
				<a href={parkingLot.link} target='_blank'>
					Dettagli
				</a>
			</div>
		</div>
	);
}

export default ParkCard