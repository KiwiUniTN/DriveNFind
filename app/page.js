import Wrapper from "./components/Wrapper";

export default  async function Home() {
	//Fetcho i dati di tutti i parcheggio
	let data = await fetch(
		process.env.NEXT_PUBLIC_API_BASE_URL + "/api/parking-spots"
	);
	let spots = await data.json();

	return (
		<div className='h-screen w-screen flex flex-col items-center justify-center bg-beigeChiaro'>
			<Wrapper spots={spots} />
		</div>
	);
}
