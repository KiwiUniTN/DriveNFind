import React from 'react'

/**
 * @param {{ parkingLot: parkingLot }} props
 */


const ParkCard = ({ parkingLot }) => {
	return (
		<div className='p-2'>
			<div className='poppins-semibold'>{parkingLot.nome.toUpperCase()}</div>
			<div className='raleway-semibold'>
				Indirizzo:
				<span className='raleway-regular'>{parkingLot.indirizzo.charAt(0).toUpperCase()+parkingLot.indirizzo.slice(1)}</span>
			</div>
			<div className='raleway-semibold'>
				Disponibilità:
				<span className='raleway-regular'>{parkingLot.disponibilita}</span>
			</div>
			<div className='raleway-semibold'>
				Tipologia: <span className='raleway-regular'>{parkingLot.tipologia}</span>
			</div>
			<div className='raleway-semibold'>
				Regolamento: <span className='raleway-regular'>{parkingLot.regolamento}</span>
			</div >
			<div className='raleway-semibold'>
				Parcheggio giallo per disabili: <span className='raleway-regular'>{parkingLot.disabile ? "sì" : "no"}</span>
			</div>
			<div className='raleway-semibold'>
				Alimentazione: <span className='raleway-regular'>{parkingLot.alimentazione}</span>
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