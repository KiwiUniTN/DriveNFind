import dynamic from "next/dynamic";
import ParkingMap from "./components/ParkingMap";
import NavbarWrapper from "./components/NavbarWrapper";

export default async function Home() {
	//Fetcho i dati di tutti i parcheggio
	let data = await fetch(
		process.env.NEXT_PUBLIC_API_BASE_URL + "/api/parking-spots"
	);
	let spots = await data.json();

	return (
		<div className='h-screen w-screen flex flex-col items-center justify-center bg-beigeChiaro'>
			<NavbarWrapper className='h-1/6 w-screen' />
			<ParkingMap parkingSpots={spots} />
		</div>
	);
}
