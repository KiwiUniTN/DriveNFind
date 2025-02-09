import React, { use, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter } from "@fortawesome/free-solid-svg-icons";

function getAPIStringfromFilters(filters, freeOnly) {
	const mapFilters = {
		tutti: "",
		pagamento: "regolamento=pagamento,pagamento-disco orario",
		gratis: "regolamento=disco orario,gratuito senza limitazione d'orario",
		disabili: "disabile=true",
		elettrico: "alimentazione=elettrico",
		tipologia: "tipologia=coperto"
	};

	let query = "";
	for (const filter in filters) {
		if (filters[filter]) {
			query += mapFilters[filter] + "&";
		}
	}

	if (freeOnly) {
		query += "disponibilita=libero&";
	}

	query = query.slice(0, -1); // Remove trailing "&"
	return query;
}


const SearchBar = ({ refreshSpots, position, cardSpots }) => {
	const [query, setQuery] = useState("");
	const [freeOnly, setFreeOnly] = useState(true);
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLoading, setIsLoading] = useState(false);



	const [filters, setFilters] = useState({
		tutti: "tutti",
		pagamento: false,
		gratis: false,
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
				refreshSpots("");
				return {
					tutti: "tutti",
					pagamento: false,
					gratis: false,
					disabili: false,
					elettrico: false,
					tipologia: false,
				};
			} else if (filterName === "pagamento" || filterName === "gratis") {
				const oppositeFilter = filterName === "pagamento" ? "gratis" : "pagamento";
				const updatedFilters = {
					...prevFilters,
					tutti: "",
					[filterName]: !prevFilters[filterName],
					[oppositeFilter]: false
				};

				const isAnyFilterActive = Object.keys(updatedFilters).some(
					(key) => key !== "tutti" && updatedFilters[key]
				);

				if (!isAnyFilterActive) {
					updatedFilters.tutti = "tutti";
				}

				return updatedFilters;
			} else {
				// Original logic for other filters
				const updatedFilters = {
					...prevFilters,
					tutti: "",
					[filterName]: !prevFilters[filterName],
				};

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
		const query = getAPIStringfromFilters(filters, freeOnly);
		refreshSpots(query);
	}, [filters, freeOnly]); // React when `freeOnly` state changes and filters changes
	
	//Google Places API quando avremo i soldi
	// Fetch location suggestions from Nominatim
	const fetchLocations = async (searchTerm) => {
		setIsLoading(true);

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&countrycodes=IT&addressdetails=1&polygon=1&bounded=1&viewbox=${
					position[1] - 0.25
				},${position[0] - 0.25},${position[1] + 0.25},${
					position[0] + 0.25
				}&q=${searchTerm}`
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
	const uniqueSuggestions = Array.from(
		new Map(suggestions.map(item => [item.address.road, item])).values()
	);
	return (
		<div className='flex rounded-box items-center gap-2 join'>
			<label className='input input-bordered flex items-center gap-2 bg-white'>
				<input
					type='text'
					className='grow text-black raleway-regular'
					placeholder='Cerca la tua destinazione'
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
			{uniqueSuggestions.length > 0 && (
				<ul className='raleway-regular absolute top-12 left-0 w-full mt-2 bg-white border rounded shadow-md z-50 max-h-40 overflow-auto'>
					{uniqueSuggestions.map((location, index) => (
						<li
							key={index}
							className='p-2 hover:bg-gray-200 cursor-pointer'
							onClick={() => handleLocationSelect(location)}>
							{location.address.aeroway} {location.address.railway} {location.address.building} {location.address.road} {location.address.county}
						</li>
					))}
				</ul>
			)}

			<details className='dropdown rounded-box'>
				<summary className='btn bg-white border-none hover:bg-slate-900'>
					<FontAwesomeIcon
						icon={faFilter}
						className='text-gray h-5 w-5 bg-wh '
					/>
				</summary>
				<ul className='menu dropdown-content bg-white rounded-box z-[1]  w-52'>
					<li>
						<div className='form-control'>
							<label className='label cursor-pointer justify-between w-40 '>
								<span className='label-text text-black raleway-regular'>Tutti</span>
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
								<span className='label-text text-black raleway-regular'>A Pagamento</span>
								<input
									type='checkbox'
									className='checkbox'
									checked={filters.pagamento}
									onChange={() => handleCheckboxChange("pagamento")}
								/>
							</label>
						</div>
					</li>
					<li>
						<div className='form-control'>
							<label className='label cursor-pointer flex justify-between w-40'>
								<span className='label-text text-black raleway-regular'>Gratuito</span>
								<input
									type='checkbox'
									className='checkbox'
									checked={filters.gratis}
									onChange={() => handleCheckboxChange("gratis")}
								/>
							</label>
						</div>
					</li>
					<li>
						<div className='form-control'>
							<label className='label cursor-pointer flex justify-between w-40'>
								<span className='label-text text-black raleway-regular'>Per Disabili</span>
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
								<span className='label-text text-black raleway-regular'>Elettrico</span>
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
								<span className='label-text text-black raleway-regular'>Coperto</span>
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
			<div className="flex items-center gap-1 flex-col">
				<span className="text-nowrap text-xs text-gray-600">Parcheggi Liberi</span>
				<input type="checkbox" className="toggle toggle-success" checked={freeOnly} onChange={() => setFreeOnly(!freeOnly)} />
			</div>
		</div>
	);
};

export default SearchBar;
