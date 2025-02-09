import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js 13+ use next/navigation instead of next/router

const ReportCard = ({ report, getJWT, isAdmin, onDelete, parkingSpot }) => {
	const router = useRouter();
	const [isModifica, setIsModifica] = useState(false);
	const [description, setDescription] = useState(report.description);
	const [imageUrl, setImageUrl] = useState(report.imageUrl);
	const [imageFile, setImageFile] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [status, setStatus] = useState(report.status);
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
	const handleDelete = async () => {
		const token = await getJWT();

		try {
			const response = await fetch(
				`/api/users/baseusers/reports?id=${report._id}`,
				{
					method: "DELETE",
					headers: {
						authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Failed to delete report:", errorText);
				return;
			}

			// Optionally, you could provide feedback to the user about the successful deletion
			console.log("Report deleted successfully");

			// Close the delete confirmation dialog
			setIsDeleting(false);

			// You can also trigger a page refresh or update the UI accordingly
			router.refresh(); // If needed to reflect changes immediately
			onDelete(report._id);
		} catch (error) {
			console.error("Error during deletion:", error);
			setIsDeleting(false); // Ensure deletion dialog is closed even in case of an error
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
	// Define background colors for different statuses
	const getBgColor = (status) => {
		switch (status) {
			case "Evasa":
				return "bg-[#a0b536]";
			case "In elaborazione":
				return "bg-yellow-500";
			case "In sospeso":
				return "bg-[#ae171c]";
			default:
				return "bg-white";
		}
	};

	const handleChange = async (event) => {
		setStatus(event.target.value);

		// Create FormData object
		const formData = new FormData();
		formData.append("status", event.target.value);

		const response = await fetch(`/api/users/reports?reportId=${report._id}`, {
			method: "PATCH",
			headers: {
				authorization: `Bearer ${await getJWT()}`, // Do NOT set "Content-Type" for FormData
			},
			body: formData, // Send FormData instead of JSON
		});

		if (!response.ok) {
			console.error("Failed to update status:", response.status);
		} else {
			console.log("Status updated successfully");
		}
	};

	return (
		<div className='card bg-slate-200 w-90 h-96 shadow-xl p-5'>
			<figure>
				{isModifica ? (
					<input type='file' accept='image/*' className="text-xs" onChange={handleImageChange} />
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
					<h2 className='card-title raleway-semibold'>{parkingSpot?.nome.toUpperCase()}</h2>
					{isAdmin ? (

						<select
							className={`border p-2 rounded text-white raleway-regular ${getBgColor(status)}`}
							defaultValue={report.status}
							onChange={handleChange}>
							<option className=' raleway-regular bg-[#ae171c]'>In sospeso</option>
							<option className='bg-yellow-500 raleway-regular' value='In elaborazione'>
								In elaborazione
							</option>
							<option value='Evasa' className='bg-[#a0b536] raleway-regular'>
								Evasa
							</option>
						</select>
					) : (
						<>

							<p
								className={`text-xs raleway-regular text-white border-none badge  ${report.status === "Evasa"
									? "bg-[#a0b536]"
									: report.status === "In elaborazione"
										? "bg-yellow-500"
										: "bg-[#ae171c]"
									}`}>
								{report.status}
							</p>
						</>
					)}
				</div>
				<textarea className="textarea textarea-primary !bg-white !text-black raleway-regular"
					disabled={!isModifica}
					value={description}
					onChange={handleDescriptionChange}
				/>
				{isAdmin ? null : (
					<>
						<div className='card-actions justify-end'>
							<button
								className='poppins-semibold btn btn-xs text-white bg-[#2e3b43] border-none sm:btn-sm md:btn-md lg:btn-lg z-10 h-auto flex items-center hover:bg-slate-900'
								onClick={isModifica ? updateReport : handleToggleModifica}>
								{isModifica ? "SALVA" : "MODIFICA"}
							</button>
							<button className='poppins-semibold btn btn-xs text-white bg-[#ad181a] border-none sm:btn-sm md:btn-md lg:btn-lg z-10 h-auto flex items-center hover:bg-slate-900'
								onClick={() => setIsDeleting(true)}>
								ELIMINA
							</button>
						</div>
						{isDeleting && (
							<div role='alert' className='alert alert-warning p-2 text-sm flex items-center gap-2 mt-2 bg-[#ad181a] text-white' >
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-6 w-6 shrink-0 stroke-current'
									fill='none'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
									/>
								</svg>
								<span>Attenzione: Vuoi davvero eliminare la segnalazione?</span>
								<div className="flex gap-2">
									<button
										className='btn btn-sm bg-white text-slate-900 hover:bg-slate-300'
										onClick={handleDelete}>
										SI
									</button>
									<button
										className='btn btn-sm bg-white text-slate-900 hover:bg-slate-300'
										onClick={() => setIsDeleting(false)}>
										NO
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default ReportCard;
