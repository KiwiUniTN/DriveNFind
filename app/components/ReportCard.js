import React from "react";

const ReportCard = ({ report }) => {
	;
	console.log("report in card", report);

	return (
		<div className='card bg-slate-200 w-80 h-96 shadow-xl p-5'>
			<figure>
				{report.imageUrl ? (
					<img
						className='rounded-lg w-full h-48 object-cover object-center'
						src={report.imageUrl}
						alt='Segnalazione Utente'
					/>
				) : (
					<div className='card bg-slate-300 text-primary-content w-96'>
						<div className='card-body'>
							<h2 className='card-title'>Nessun Immagine Disponibile</h2>
						</div>
					</div>
				)}
			</figure>
			<div className='card-body p-3'>
				<div
					className={`flex w-full justify-between align-center gap-6 items-center`}>
					<h2 className='card-title'>Segnalazione</h2>
					<p
						className={`text-xs badge text-black ${
							report.status === "Evasa"
								? "bg-green-500"
								: report.status === "In elaborazione"
								? "bg-yellow-500"
								: "bg-red-500"
						}`}>
						{report.status}
					</p>
				</div>
				<p className='text-sm'>{report.description}</p>
				<div className='card-actions justify-end'>
					<button className='badge badge-outline bg-azzurro'>Modifica</button>
					<button className='badge badge-outline bg-rosso'>Elimina</button>
				</div>
			</div>
		</div>
	);
};

export default ReportCard;
