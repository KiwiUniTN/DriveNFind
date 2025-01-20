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
		return new Response(JSON.stringify({ message: error.message }), {status: 403,});
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
			JSON.stringify({ message: `Report creation failed:${error.message}` }),{ status: 500 });
	}
	
}
/* elimina una segnalazione dato l'Id messo nel body in questo modo {"id" : <id>} */
export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
  	const id = searchParams.get('id');
    try {
        await validateUser(req);
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), {
            status: 403,
        });
    }

	const deletionSuccess = await Report.findByIdAndDelete(id);
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
async function validateUser(req) {
	const userAuth = await authorizeRole(["baseuser"])(req);
	if (!userAuth.authorized) {
		return Response.json({ message: "User not authorized" }, { status: 403 });
	}
	return userAuth;
}
