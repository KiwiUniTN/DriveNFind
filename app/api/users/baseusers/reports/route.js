import { authorizeRole } from "../../../../../app/middleware/auth";
import Report from "../../../../../app/models/Report";
import { connectToDB } from '../../../../../app/lib/database';
/* crea un report dato nel body della richiesta 
    "parkingLotId": id del parcheggio,
    "description": "descrizione del problema",
    "imageUrl": "path/to/image" */

export async function POST(req, res) {
	// Authenticate user based on the provided token
	const body = typeof req.json === 'function' ? await req.json() : req.body;
	const userAuth = await authorizeRole(["baseuser"])(req);
	// console.log(userAuth.authorized)
	if (!userAuth.authorized) {
		return userAuth.response; // Return error response if user is not authorized
	}
	// Check if the required fields are present in the body
	if (!body.parkingLotId || !body.description || !body.imageUrl) {
		return new Response(
		JSON.stringify({ message: 'Missing required fields: parkingLotId, description, and/or imageUrl' }),
		{ status: 400 }
		);
	}
	
	try {
		await connectToDB();
		const newReport = {
		username: userAuth.user.username,
		parkingLotId: body.parkingLotId,
		description: body.description,
		status: "In sospeso",
		imageUrl: body.imageUrl,
		};
	
		// Create the report
		const createdReport = await Report.create(newReport);
		return new Response(JSON.stringify(createdReport), { status: 201 });
	} catch (error) {
		// Handle any errors that occur during report creation
		return new Response(
		JSON.stringify({ message: `Report creation failed: ${error.message}` }),
		{ status: 500 }
		);
	}
	}
	  
/* elimina una segnalazione dato l'Id messo nel body in questo modo {"id" : <id>} */
export async function DELETE(req) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");

	if (!id) {
	return new Response(
		JSON.stringify({ message: "Missing required report ID" }),
		{ status: 400 }
	);
	}

	const userAuth = await authorizeRole(["baseuser"])(req);

	if (!userAuth.authorized) {
		return userAuth.response;
	}

	try {
	  await connectToDB();
	  // Ensure a database connection
	  
	//   console.log('bene')
	  const deletionSuccess = await Report.findByIdAndDelete(id);
	//   console.log('male')
	  if (deletionSuccess) {
		return new Response(
		  JSON.stringify({ message: "Report deleted successfully" }),
		  { status: 200 }
		);
	  } else {
		return new Response(
		  JSON.stringify({ message: "Report not found or already deleted" }),
		  { status: 404 }
		);
	  }
	} catch (error) {
	//   console.error("Error during report deletion:", error);
	  return new Response(
		JSON.stringify({ message: "Internal server error" }),
		{ status: 500 }
	  );
	}
  }
  
