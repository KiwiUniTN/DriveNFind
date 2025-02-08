import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js 13+ use next/navigation instead of next/router


const ReportCard = ({ report, getJWT }) => {
	const router = useRouter();
	const [isModifica, setIsModifica] = useState(false);
	const [description, setDescription] = useState(report.description);
	const [imageUrl, setImageUrl] = useState(report.imageUrl);
	const [imageFile, setImageFile] = useState(null); // Nuovo stato per il file

	const handleToggleModifica = () => {
		setIsModifica(!isModifica);
	};

	const handleDescriptionChange = (e) => {
		setDescription(e.target.value);
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImageFile(file); // Salva il file nello stato
			const reader = new FileReader();
			reader.onload = (event) => {
				setImageUrl(event.target.result); // Mostra l'anteprima dell'immagine
			};
			reader.readAsDataURL(file);
		}
	};

	const updateReport = async () => {
		const token = await getJWT();
		if (!token) {
			console.error("Failed to get JWT");
			return;
		}

		const formData = new FormData();
		formData.append("description", description);
		if (imageFile) {
			formData.append("image", imageFile); // Aggiunge l'immagine solo se è stata cambiata
		}

		const response = await fetch(`/api/users/reports?reportId=${report._id}`, {
			method: "PATCH",
			headers: {
				authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Failed to update report:", errorText);
			return;
		}

		// Aggiorna lo stato dopo il successo
		const updatedReport = await response.json();
		setImageUrl(updatedReport.report.imageUrl);
		setDescription(updatedReport.report.description);
		setIsModifica(false);
		router.refresh(); // Aggiorna la pagina per mostrare l'immagine aggiornata
	};

	return (
		<div className='card bg-slate-200 w-80 h-96 shadow-xl p-5'>
			<figure>
				{isModifica ? (
					<input type='file' accept='image/*' onChange={handleImageChange} />
				) : imageUrl ? (
					<img
						className='rounded-lg w-full h-48 object-cover object-center'
						src={imageUrl}
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
				<div className='flex w-full justify-between align-center gap-6 items-center'>
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
				<textarea
					className='text-sm bg-transparent w-full h-24'
					disabled={!isModifica}
					value={description}
					onChange={handleDescriptionChange}
				/>
				<div className='card-actions justify-end'>
					<button
						className='badge badge-outline bg-azzurro'
						onClick={isModifica ? updateReport : handleToggleModifica}>
						{isModifica ? "Salva" : "Modifica"}
					</button>
					<button className='badge badge-outline bg-rosso'>Elimina</button>
				</div>
			</div>
		</div>
	);
};

export default ReportCard;
