import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js 13+ use next/navigation instead of next/router

const ReportCard = ({ report, getJWT, isAdmin ,onDelete }) => {
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
				return "bg-green-500";
			case "In elaborazione":
				return "bg-yellow-500";
			case "In sospeso":
				return "bg-gray-500";
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
		<div className='card bg-slate-200 w-80 h-96 shadow-xl p-5'>
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
					{isAdmin ? (
						<select
							className={`border p-2 rounded text-white ${getBgColor(status)}`}
							defaultValue={report.status}
							onChange={handleChange}>
							<option className='bg-red-500'>{report.status}</option>
							<option className='bg-yellow-500' value='In elaborazione'>
								In elaborazione
							</option>
							<option value='Evasa' className='bg-green-500'>
								Evasa
							</option>
						</select>
					) : (
						<>
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
						</>
					)}
				</div>
				<textarea
					className='text-sm bg-transparent w-full h-24'
					disabled={!isModifica}
					value={description}
					onChange={handleDescriptionChange}
				/>
				{isAdmin ? null : (
					<>
						<div className='card-actions justify-end'>
							<button
								className='badge badge-outline bg-azzurro'
								onClick={isModifica ? updateReport : handleToggleModifica}>
								{isModifica ? "Salva" : "Modifica"}
							</button>
							<button
								className='badge badge-outline bg-rosso'
								onClick={() => setIsDeleting(true)}>
								Elimina
							</button>
						</div>
						{isDeleting && (
							<div role='alert' className='alert alert-warning'>
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
								<span>Attenzione: Vuoi eliminare la segnalazione</span>
								<div>
									<button
										className='btn btn-sm bg-red-500'
										onClick={handleDelete}>
										Si
									</button>
									<button
										className='btn btn-sm bg-transparent'
										onClick={() => setIsDeleting(false)}>
										No
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
