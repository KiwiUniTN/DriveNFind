import React from 'react'

/**
 * @param {{ parkingLot: parkingLot }} props
 */


const ParkCard = ({ parkingLot }) => {
    return (
			<div className='p-2'>
				<div className='font-bold'>{parkingLot.nome}</div>
				<div >
					Disponibilità : <span>{parkingLot.disponibilita}</span>
				</div>
				<div>
					Tipologia: <span>{parkingLot.tipologia}</span>
				</div>
				<div>
					Regolamento: <span>{parkingLot.regolamento}</span>
				</div>
				<div>
					Per disabili: <span>{parkingLot.disabile ? "Sì" : "No"}</span>
				</div>
				<div>
					Alimentazione: <span>{parkingLot.alimentazione}</span>
				</div>
				<div>
					<a href={parkingLot.link} target='_blank'>
						Dettagli
					</a>
				</div>
			</div>
		);
}

export default ParkCard