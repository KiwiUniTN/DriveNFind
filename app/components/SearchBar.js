import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter } from "@fortawesome/free-solid-svg-icons";

function getAPIStringfromFilters(filters, freeOnly) {
	const mapFilters = {
		pagamento: "regolamento=pagamento,pagamento-disco orario",
		gratis: "regolamento=disco orario,gratuito senza limitazione d'orario",
		disabili: "disabile=true",
		elettrico: "alimentazione=elettrico",
		tipologia: "tipologia=coperto",
	};

	let query = "";
	if (freeOnly) {
		query += "disponibilita=libero&";
	}
	for (const filter in filters) {
		if (filters[filter]) {
			query += mapFilters[filter] + "&";
		}
	}
	query = query.slice(0, -1); // Remove trailing "&"
	return query;
}

const SearchBar = ({ refreshSpots, position, cardSpots, freeOnly, setFreeOnly, setSuggestionsPerAlert }) => {
	const [query, setQuery] = useState("");

	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [filters, setFilters] = useState({
		pagamento: false,
		gratis: false,
		disabili: false,
		elettrico: false,
		tipologia: false,
	});
	// Handle checkbox changes
	const handleCheckboxChange = (filterName) => {
		setFilters((prevFilters) => {
			if (filterName === "pagamento" || filterName === "gratis") {
				const oppositeFilter =
					filterName === "pagamento" ? "gratis" : "pagamento";
				return {
					...prevFilters,
					[filterName]: !prevFilters[filterName],
					[oppositeFilter]: false,
				};
			} else {
				return {
					...prevFilters,
					[filterName]: !prevFilters[filterName],
				};
			}
		});
	};

	useEffect(() => {
		const query = getAPIStringfromFilters(filters, freeOnly);
		console.log("Query:", query);
		refreshSpots(query);
	}, [filters, freeOnly]);

	const fetchLocations = async (searchTerm) => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&countrycodes=IT&addressdetails=1&polygon=1&bounded=1&viewbox=${position[1] - 0.25
				},${position[0] - 0.25},${position[1] + 0.25},${position[0] + 0.25
				}&q=${searchTerm}`
			);
			if (!response.ok)
				throw new Error(`HTTP error! Status: ${response.status}`);
			const data = await response.json();
			setSuggestions(data);
			setSuggestionsPerAlert(data);
		} catch (error) {
			console.error("Error fetching locations:", error);
			setSuggestions([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const value = e.target.value;
		setInputValue(value);
		setQuery(value);
		if (!value.trim()) {
			setShowSuggestions(false);
			setSuggestions([]);
		}
	};

	const handleIconClick = async () => {
		if (!query.trim()) return;
		setIsLoading(true);
		setInputValue("");
		try {
			await fetchLocations(query);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLocationSelect = (location) => {
		setQuery(location.display_name);
		setSuggestions([]);
		setShowSuggestions(false);
		const { lat, lon } = location;
		let queryAPI = getAPIStringfromFilters(filters, freeOnly);
		queryAPI += lat ? `&lat=${lat}` : "";
		queryAPI += lon ? `&long=${lon}` : "";
		console.log("Query:", queryAPI);
		refreshSpots(queryAPI).then((res) => {
			cardSpots(res);
		});
	};

	const uniqueSuggestions = Array.from(
		new Map(suggestions.map((item) => [item.address.road, item])).values()
	);

	return (
		<div className='flex rounded-box items-center gap-2 join flex-wrap'>
			<label className='input input-bordered flex items-center gap-2 bg-white'>
				<input
					type='text'
					className=' text-black raleway-regular flex-shrink text-xs sm:text-sm '
					placeholder='Cerca la tua destinazione'
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleIconClick();
						}
					}}

				/>
				{!isLoading ? (
					<FontAwesomeIcon
						icon={faMagnifyingGlass}
						className='text-beigeChiaro h-5 w-5 hover:text-beigeChiaro flex-shrink-0'
						onClick={handleIconClick}
					/>
				) : (
					<span className='loading loading-spinner loading-xs'></span>					
				)}
			</label>

			{uniqueSuggestions.length > 0 && (
				<ul className='raleway-regular absolute top-12 left-0 w-full mt-2 bg-white border rounded shadow-md z-50 max-h-40 overflow-auto'>
					{uniqueSuggestions.map((location, index) => (
						<li
							key={index}
							className='p-2 hover:bg-gray-200 cursor-pointer'
							onClick={() => handleLocationSelect(location)}>
							{location.address.aeroway} {location.address.railway}{" "}
							{location.address.building} {location.address.road}{" "}
							{location.address.county}
						</li>
					))}
				</ul>
			)}

			<details className='dropdown-end rounded-box sm:dropdown'>
				<summary className='btn bg-white border-none hover:bg-slate-900 '>
					<FontAwesomeIcon
						icon={faFilter}
						className='text-gray h-5 w-5 bg-wh'
					/>
				</summary>
				<ul className='menu dropdown-content bg-white rounded-box z-[1] w-52'>
					<li>
						<div className='form-control'>
							<label className='label cursor-pointer flex justify-between w-40'>
								<span className='label-text text-black raleway-regular'>
									A Pagamento
								</span>
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
								<span className='label-text text-black raleway-regular'>
									Gratuito
								</span>
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
								<span className='label-text text-black raleway-regular'>
									Per Disabili
								</span>
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
								<span className='label-text text-black raleway-regular'>
									Elettrico
								</span>
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
								<span className='label-text text-black raleway-regular'>
									Coperto
								</span>
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
			<label className='raleway-semibold flex items-center gap-2 cursor-pointer'>
				<input
					type='checkbox'
					className='toggle checked:bg-[#a0b536] toggle-success'
					checked={freeOnly}
					onChange={() => setFreeOnly(!freeOnly)}
				/>
				{freeOnly
					? "Mostrando solo parcheggi liberi"
					: "Mostrando tutti i parcheggi"}
			</label>
		</div>
	);
};

export default SearchBar;
