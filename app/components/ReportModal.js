import { useState } from "react";

const ReportModal = ({ isOpen, onClose, onSubmit, parkId }) => {
	const [image, setImage] = useState(null);
	const [description, setDescription] = useState("");
	const [lotId, setLotId] = useState(parkId);
	const [errors, setErrors] = useState({});

	const handleImageChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			setImage(file);
		}
	};

	const validateForm = () => {
		let newErrors = {};
		if (!image) newErrors.image = 'L\'immagine è obbligatoria.';
		if (!description.trim()) newErrors.description = 'La descrizione è obbligatoria.';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0; // Se non ci sono errori, ritorna true
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (validateForm()) {
			console.log('Form inviato con:', { image, description });
			onSubmit({ image, description, lotId });
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
			<div className='bg-white p-6 rounded-lg shadow-lg w-96'>
				<h2 className='text-xl poppins-semibold font-semibold mb-4'>
					SEGNALA UN PROBLEMA
				</h2>

				{/* Image Picker */}
				<label className='block mb-3'>
					<span className='text-gray-700 raleway-semibold'>
						Carica un'immagine:
					</span>
					<input
						type='file'
						accept='image/*'
						onChange={handleImageChange}
						className='mt-2 w-full raleway-regular'
					/>
					{errors.image && <p className="raleway-semibold text-[#ad181a]">{errors.image}</p>}
				</label>
				{/* Text Field */}
				<textarea
					className='w-full p-2 border rounded-lg raleway-regular raleway-regular text-white'
					placeholder='Descrivi il problema...'
					value={description}
					onChange={(e) => setDescription(e.target.value)}>
				</textarea>
				{errors.description && <p className="raleway-semibold text-[#ad181a]">{errors.description}</p>}


				{/* Buttons */}
				<div className='flex justify-between mt-4'>
					<button
						onClick={handleSubmit}
						className='bg-[#ad181a] text-white px-4 py-2 rounded-lg raleway-semibold hover:bg-slate-900'>
						SEGNALA
					</button>
					<button
						onClick={onClose}
						className='bg-gray-400 hover:bg-slate-900 text-white px-4 py-2 rounded-lg raleway-semibold'>
						ESCI
					</button>
				</div>
			</div>
		</div>
	);
};

export default ReportModal;
