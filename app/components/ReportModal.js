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
                <h2 className="text-xl font-semibold mb-4">Segnala un Problema</h2>

                {/* Image Picker */}
                <label className="block mb-3">
                    <span className="text-gray-700">Carica un'immagine:</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 w-full" />
                </label>
                {image && <img src={image} alt="Preview" className="w-full h-32 object-cover mb-3 rounded-lg" />}

                {/* Text Field */}
                <textarea
                    className="w-full p-2 border rounded-lg"
                    placeholder="Descrivi il problema..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>

                {/* Buttons */}
                <div className="flex justify-between mt-4">
                    <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                        Segnala
                    </button>
                    <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded-lg">
                        Esci
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
