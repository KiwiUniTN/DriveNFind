import React, { use, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter } from "@fortawesome/free-solid-svg-icons";

function getAPIStringfromFilters(filters) {
	const mapFilters = {
		tutti: "",
		disponibilita: "disponibilita=libero",
		regolamento: "regolamento=pagamento",
		disabili: "disabile=true",
		elettrico: "alimentazione=elettrico",
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

const SearchBar = ({ refreshSpots, position , cardSpots}) => {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	

	const [filters, setFilters] = useState({
		tutti: true,
		disponibilita: false,
		regolamento: false,
		disabili: false,
		elettrico: false,
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
					tutti: true,
					disponibilita: false,
					regolamento: false,
					disabili: false,
					elettrico: false,
				};
			} else {
				const updatedFilters = {
					...prevFilters,
					tutti: false,
					[filterName]: !prevFilters[filterName],
				};

				// Se nessun filtro è attivo, riattivo "Tutti"
				const isAnyFilterActive = Object.keys(updatedFilters).some(
					(key) => key !== "tutti" && updatedFilters[key]
				);

				if (!isAnyFilterActive) {
					updatedFilters.tutti = true;
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
	 */
	

	useEffect(() => {
		const query = getAPIStringfromFilters(filters);
		refreshSpots(query);
	}, [filters]); //Se filters cambia, allora rifai il fetch

	// Fetch location suggestions from Nominatim
	const fetchLocations = async (searchTerm) => {
		if (!searchTerm) {
			setSuggestions([]);
			return;
		}

		try {
			//position[0]+1, position[1]+1, position[0]-1,position[1]-1 serve a limitare la ricerca all'interno di un quadrato con centro alla posizione del Duomo di Trento, TODO: cambiare con la posizione dell'utente
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&countrycodes=IT&limit=3&bounded=1&viewbox=${
					position[1] - 0.25
				},${position[0] - 0.25},${position[1] + 0.25},${
					position[0] + 0.25
				}&q=${searchTerm}`
			);
			const data = await response.json();
			console.log("Suggestions:", data);
			setSuggestions(data);
		} catch (error) {
			console.error("Error fetching locations:", error);
		}
	};

	// Handle input change
	const handleInputChange = (e) => {
		const value = e.target.value;
		setQuery(value);
		setShowSuggestions(true);
		fetchLocations(value);
	};
	// Handle search icon click
	const handleIconClick = () => {
		if (query) {
			fetchLocations(query); // Fetch suggestions based on the current query
			setShowSuggestions(true); // Show the suggestions
		}
	};
	// Handle location selection
	const handleLocationSelect = (location) => {
		setQuery(location.display_name);
		setSuggestions([]);
		const { lat, lon } = location;
		let queryAPI = getAPIStringfromFilters(filters);
		queryAPI += lat ? `&lat=${lat}` : "";
		queryAPI += lon ? `&long=${lon}` : "";
		refreshSpots(queryAPI).then((res)=> {cardSpots(res)});
	};

	return (
		<div className='flex bg-base-300 p-2 rounded-box items-center gap-2 join'>
			<label className='input input-bordered flex items-center gap-2'>
				<input
					type='text'
					className='grow text-beigeChiaro'
					placeholder='Cerca'
					onChange={handleInputChange}
				/>
				<FontAwesomeIcon
					icon={faMagnifyingGlass}
					className='text-beigeChiaro h-5 w-5 hover:text-beigeChiaro'
					onClick={handleIconClick}
				/>
			</label>
			{/* Dropdown Suggestions */}
			{suggestions.length > 0 && (
				<ul className='absolute top-12 left-0 w-full bg-white border rounded shadow-md z-50 max-h-40 overflow-auto'>
					{suggestions.map((location, index) => (
						<li
							key={index}
							className='p-2 hover:bg-gray-200 cursor-pointer'
							onClick={() => handleLocationSelect(location)}>
							{location.display_name}
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
				</ul>
			</details>
		</div>
	);
};

export default SearchBar;
