import { useState } from "react";

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState("");

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        onSubmit({ image, description });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl poppins-semibold font-semibold mb-4">SEGNALA UN PROBLEMA</h2>

                {/* Image Picker */}
                <label className="block mb-3">
                    <span className="text-gray-700 raleway-semibold">Carica un'immagine:</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 w-full raleway-regular" />
                </label>
                {image && <img src={image} alt="Preview" className="w-full h-32 object-cover mb-3 rounded-lg" />}

                {/* Text Field */}
                <textarea
                    className="w-full p-2 border rounded-lg raleway-regular raleway-regular text-white"
                    placeholder="Descrivi il problema..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>

                {/* Buttons */}
                <div className="flex justify-between mt-4">
                    <button onClick={handleSubmit} className="bg-[#ad181a] text-white px-4 py-2 rounded-lg raleway-semibold hover:bg-slate-900">
                        SEGNALA
                    </button>
                    <button onClick={onClose} className="bg-gray-400 hover:bg-slate-900 text-white px-4 py-2 rounded-lg raleway-semibold">
                        ESCI
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
