import React, { use, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter } from "@fortawesome/free-solid-svg-icons";

const SearchBar = ({ refreshSpots }) => {
	const [filters, setFilters] = useState({
		tutti: true,
		disponibilita: false,
		regolamento: false,
		disabili: false,
		elettrico: false,
	});
	useEffect(() => {
		refreshSpots("");
	}, []);
	const handleCheckboxChange = (filterName) => {
		setFilters((prevFilters) => {
			if (filterName === "tutti") {
				// If "Tutti" is checked, uncheck all others
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
	const mapFilters = {
		tutti: "",
		disponibilita: "disponibilita=libero",
		regolamento: "regolamento=pagamento",
		disabili: "disabile=true",
		elettrico: "alimentazione=elettrico",
	};
	useEffect(() => {
		let query = "";
		for (const filter in filters) {
			if (filters[filter]) {
				query += mapFilters[filter] + "&";
			}
		}
		query = query.slice(0, -1); // Rimuovo l'ultimo carattere "&"
		// console.log(query);
		refreshSpots(query);
	}, [filters]); //Se filters cambia, allora rifai il fetch
	return (
		<div className='flex bg-base-300 p-2 rounded-box items-center gap-2 join'>
			<label className='input input-bordered flex items-center gap-2'>
				<input
					type='text'
					className='grow text-beigeChiaro'
					placeholder='Cerca'
				/>
				<FontAwesomeIcon
					icon={faMagnifyingGlass}
					className='text-beigeChiaro h-5 w-5 hover:text- '
				/>
			</label>

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
