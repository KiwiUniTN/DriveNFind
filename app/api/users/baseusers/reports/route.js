import { authorizeRole } from "@/app/middleware/auth";
import Report from "@/app/models/Report";
/* crea un report dato nel body della richiesta 
    "parkingLotId": id del parcheggio,
    "description": "descrizione del problema",
    "imageUrl": "path/to/image" */

export async function POST(req, res) {
	// Authenticate user based on the provided token
    let userAuth;
    let body;
	try {
		userAuth= await validateUser(req);
		body = await req.json();
	} catch (error) {
		return new Response(JSON.stringify({ message: error.message }), {
			status: 403,
		});
	}

	const newReport = {
		username: userAuth.user.username,
		parkingLotId: body.parkingLotId,
		description: body.description,
		status: "In sospeso",
		imageUrl: body.imageUrl,
	};

	try {
		const createdReport = await Report.create(newReport);
		return new Response(JSON.stringify(createdReport), { status: 201 });
	} catch (error) {
		return new Response(
			JSON.stringify({ message: `Report creation failed:${error.message}` }),
			{ status: 500 }
		);
	}
	
}
/* elimina una segnalazione dato l'Id messo nel body in questo modo {"id" : <id>} */
export async function DELETE(req, res) {
    
    const body = await req.json();
    try {
        await validateUser(req);
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), {
            status: 403,
        });
    }

	const deletionSuccess = await Report.findByIdAndDelete(body.id);
	if (deletionSuccess) {
		return new Response(
			JSON.stringify({ message: "Report deleted successfully" }),
			{ status: 200 }
		);
	} else {
		return new Response(JSON.stringify({ message: "Report deletion failed" }), {
			status: 500,
		});
	}
}

// controllo se l'utente è un baseuser
async function validateUser(req) {
	const userAuth = await authorizeRole(["baseuser"])(req);
	if (!userAuth.authorized) {
		throw new Error("User not authorized");
	}
	return userAuth;
}
