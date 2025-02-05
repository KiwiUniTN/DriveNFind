import React, { use, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter } from "@fortawesome/free-solid-svg-icons";

function getAPIStringfromFilters(filters) {
	const mapFilters = {
		tutti: "",
		disponibilita: "disponibilita=libero",
		regolamento: "regolamento=pagamento,pagamento-disco orario",
		disabili: "disabile=true",
		elettrico: "alimentazione=elettrico",
		tipologia: "tipologia=coperto"
		// lat: filters.lat ? `lat=${coordinates.lat}` : "",
		// lon: filters.lon ? `long=${coordinates.lon}` : "",
	};
	let query = "";
	for (const filter in filters) {
		if (filters[filter]) {
			query += mapFilters[filter] + "&";
		}
	}
	query = query.slice(0, -1); // Rimuovo l'ultimo carattere "&"
	return query;
}

const SearchBar = ({ refreshSpots, position, cardSpots }) => {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLoading, setIsLoading] = useState(false);



	const [filters, setFilters] = useState({
		tutti: "tutti",
		disponibilita: false,
		regolamento: false,
		disabili: false,
		elettrico: false,
		tipologia: false,
	});

	// Inizializzo la lista dei parcheggi con tutti i parcheggi
	useEffect(() => {
		refreshSpots("");
	}, []);

	// Funzione che gestisce il cambio di stato dei checkbox
	const handleCheckboxChange = (filterName) => {
		setFilters((prevFilters) => {
			if (filterName === "tutti") {
				refreshSpots(""); // Faccio il fetch della rotta senza parametri
				return {
					tutti: "tutti",
					disponibilita: false,
					regolamento: false,
					disabili: false,
					elettrico: false,
					tipologia: false,
				};
			} else {
				const updatedFilters = {
					...prevFilters,
					tutti: "",
					[filterName]: !prevFilters[filterName],
				};

				// Se nessun filtro è attivo, riattivo "Tutti"
				const isAnyFilterActive = Object.keys(updatedFilters).some(
					(key) => key !== "tutti" && updatedFilters[key]
				);

				if (!isAnyFilterActive) {
					updatedFilters.tutti = "tutti";
				}

				return updatedFilters;
			}
		});
	};

	/**
	 * An object containing various map filters for a search bar.
	 * Each key represents a filter type and its corresponding value is the query string for that filter.
	 *
	 * @property {string} tutti - Represents no filter.
	 * @property {string} disponibilita - Filters by availability, showing only available items.
	 * @property {string} regolamento - Filters by regulation, showing only items with payment required.
	 * @property {string} disabili - Filters by accessibility, showing only items accessible to disabled individuals.
	 * @property {string} elettrico - Filters by power source, showing only electric items.
	 * @property {string} tipologia - Filters tipology, showing only covered items.
	 */


	useEffect(() => {
		const query = getAPIStringfromFilters(filters);
		refreshSpots(query);
	}, [filters]); //Se filters cambia, allora rifai il fetch
	//Google Places API quando avremo i soldi
	// Fetch location suggestions from Nominatim
	const fetchLocations = async (searchTerm) => {
		setIsLoading(true);

		try {
			const response = await fetch(
				'https://nominatim.openstreetmap.org/search?format=json&countrycodes=IT&addressdetails=1&polygon=1&q=' + searchTerm
			);

			if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

			const data = await response.json();
			console.log("Suggestions:", data);
			setSuggestions(data);
		} catch (error) {
			console.error("Error fetching locations:", error);
			setSuggestions([]);
		} finally {
			setIsLoading(false);
		}
	};
	// Handle input change
	const handleInputChange = (e) => {
		const value = e.target.value.trim();
		setQuery(value);
		if (!value.trim()) {
			setShowSuggestions(false);
			setSuggestions([]);
		}

	};

	// Handle search icon click
	const handleIconClick = async () => {
		if (!query.trim()) return; // Evita chiamate con input vuoto
		console.log("Search query:", query);
		setIsLoading(true);
		try {
			await fetchLocations(query);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle location selection
	const handleLocationSelect = (location) => {
		setQuery(location.display_name);
		setSuggestions([]);
		setShowSuggestions(false);
		const { lat, lon } = location;
		let queryAPI = getAPIStringfromFilters(filters);
		queryAPI += lat ? `&lat=${lat}` : "";
		queryAPI += lon ? `&long=${lon}` : "";
		refreshSpots(queryAPI).then((res) => { cardSpots(res) });
	};

	return (
		<div className='flex p-2 rounded-box items-center gap-2 join'>
			<label className='input input-bordered flex items-center gap-2'>
				<input
					type='text'
					className='grow text-beigeChiaro'
					placeholder='Cerca'
					onChange={handleInputChange}
				/>
				{!isLoading ? (
					<FontAwesomeIcon
						icon={faMagnifyingGlass}
						className='text-beigeChiaro h-5 w-5 hover:text-beigeChiaro'
						onClick={handleIconClick}
					/>
				) : (<span className='loading loading-spinner loading-xs'></span>)}
			</label>
			{/* Dropdown Suggestions */}
			{suggestions.length > 0 && (
				<ul className='absolute top-12 left-0 w-full bg-white border rounded shadow-md z-50 max-h-40 overflow-auto'>
					{suggestions.map((location, index) => (
						<li
							key={index}
							className='p-2 hover:bg-gray-200 cursor-pointer'
							onClick={() => handleLocationSelect(location)}>
							{location.address.aeroway} {location.address.railway} {location.address.building} {location.address.road} {location.address.county}
						</li>
					))}
				</ul>
			)}

			<details className='dropdown'>
				<summary className='btn'>
					<FontAwesomeIcon
						icon={faFilter}
						className='text-beigeChiaro h-5 w-5'
					/>
				</summary>
				<ul className='menu dropdown-content bg-base-100 rounded-box z-[1] text-beigeChiaro w-52'>
					<li>
						<div className='form-control'>
							<label className='label cursor-pointer justify-between w-40 '>
								<span className='label-text'>Tutti</span>
								<input
									type='checkbox'
									className='checkbox'
									checked={filters.tutti}
									onChange={() => handleCheckboxChange("tutti")}
								/>
							</label>
						</div>
					</li>
					<li>
						<div className='form-control'>
							<label className='label cursor-pointer flex justify-between w-40'>
								<span className='label-text'>Libero</span>
								<input
									type='checkbox'
									className='checkbox'
									checked={filters.disponibilita}
									onChange={() => handleCheckboxChange("disponibilita")}
								/>
							</label>
						</div>
					</li>
					<li>
						<div className='form-control'>
							<label className='label cursor-pointer flex justify-between w-40'>
								<span className='label-text'>A Pagamento</span>
								<input
									type='checkbox'
									className='checkbox'
									checked={filters.regolamento}
									onChange={() => handleCheckboxChange("regolamento")}
								/>
							</label>
						</div>
					</li>
					<li>
						<div className='form-control'>
							<label className='label cursor-pointer flex justify-between w-40'>
								<span className='label-text'>Per Disabili</span>
								<input
									type='checkbox'
									className='checkbox'
									checked={filters.disabili}
									onChange={() => handleCheckboxChange("disabili")}
								/>
							</label>
						</div>
					</li>
					<li>
						<div className='form-control'>
							<label className='label cursor-pointer flex justify-between w-40'>
								<span className='label-text'>Elettrico</span>
								<input
									type='checkbox'
									className='checkbox'
									checked={filters.elettrico}
									onChange={() => handleCheckboxChange("elettrico")}
								/>
							</label>
						</div>
					</li>
					<li>
						<div className='form-control'>
							<label className='label cursor-pointer flex justify-between w-40'>
								<span className='label-text'>Coperto</span>
								<input
									type='checkbox'
									className='checkbox'
									checked={filters.tipologia}
									onChange={() => handleCheckboxChange("tipologia")}
								/>
							</label>
						</div>
					</li>
				</ul>
			</details>
		</div>
	);
};

export default SearchBar;
