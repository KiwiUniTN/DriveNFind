import Wrapper from "./components/Wrapper";
async function getParkingSpots() {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/parking-spots`
		);
		if (!response.ok) throw new Error("Failed to fetch spots");
		return await response.json();
	} catch (error) {
		console.error(error);
		return [];
	}
}

export default  async function Home() {
	
	const spots = await getParkingSpots();
	
	return (
		<div className='h-screen w-screen flex flex-col items-center justify-center bg-beigeChiaro'>
			<Wrapper spots={spots} />
		</div>
	);
}
