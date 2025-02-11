import { authorizeRole } from "../../../../../app/middleware/auth";
import Report from "../../../../../app/models/Report";
import mongoose from "mongoose";
import cloudinary from "../../../../../app/lib/cloudinary";
import { Readable } from "stream";
import { blob } from "stream/consumers";
/* crea un report dato nel body della richiesta 
    "parkingLotId": id del parcheggio,
    "description": "descrizione del problema",
    "imageUrl": "path/to/image" */

export async function POST(req, res) {
	let userAuthsec;
	let body;
	try {
		const userAuth = await authorizeRole(["baseuser"])(req);
		
		
	if (!userAuth.authorized) {
		return Response.json({ message: "User not authorized" }, { status: 403 });
	}
	userAuthsec = userAuth;
	console.log(userAuthsec.user.username)
		body = await req.formData();
		console.log("Form data entries:", Array.from(body.entries())); // Log form data entries
	} catch (error) {
		return new Response(JSON.stringify({ message: error.message }), {
			status: 403,
		});
	}

	let parkingLotId = body.get("parkingLotId");
	try {
		// Check if the ID is valid before trying to convert it
		if (!mongoose.Types.ObjectId.isValid(parkingLotId)) {
			console.log("ID validation failed");
			return new Response(
				JSON.stringify({
					message: "Invalid parkingLotId format",
					receivedId: parkingLotId,
				}),
				{ status: 400 }
			);
		}

		parkingLotId = new mongoose.Types.ObjectId(parkingLotId);
	} catch (error) {
		console.error("Error details:", error);
		return new Response(
			JSON.stringify({
				message: "Invalid parkingLotId format",
				error: error instanceof Error ? error.message : "Unknown error",  // Assicurati che venga gestito correttamente
				receivedId: parkingLotId,
			}),
			{ status: 400 }
		);
	}
	console.log(userAuthsec.user.username)
	//Upload image to cloudinary
	let cloudinaryUrl = null;
	const imageFile = body.get("image"); // Get image from formData
	console.log("imageFile:", typeof imageFile);
	if (imageFile instanceof Blob && imageFile != "null") {
		console.log("sono dentro");
		try {
			const arrayBuffer = await imageFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// Convert buffer to readable stream
			const stream = Readable.from(buffer);

			// Upload using Cloudinary's stream upload
			const uploadResponse = await new Promise((resolve, reject) => {
				const cloudinaryStream = cloudinary.uploader.upload_stream(
					{ folder: "nextjs_reports" },
					(error, result) => {
						if (error) reject(error);
						else resolve(result);
					}
				);
				stream.pipe(cloudinaryStream);
			});

			cloudinaryUrl = uploadResponse.secure_url;
		} catch (uploadError) {
			console.error("Image upload error:", uploadError);
			return new Response(
				JSON.stringify({
					message: "Image upload failed",
					error: uploadError.message,
				}),
				{ status: 500 }
			);
		}
	}
	console.log(userAuthsec.user.username)
	const newReport = {
		parkingLotId: parkingLotId,
		username: userAuthsec.user.username,
		description: body.get("description"),
		status: "In sospeso",
		imageUrl: cloudinaryUrl,
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
/* elimina una segnalazione dato l'Id */
/* elimina una segnalazione dato l'Id */
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
	  return new Response(
		JSON.stringify({ message: "User not authorized" }),
		{ status: 403 }
	  );
	}
  
	try {
	  const deletionSuccess = await Report.findByIdAndDelete(id);
	  if (deletionSuccess) {
		return new Response(
		  JSON.stringify({ message: "Report deleted successfully" }),
		  { status: 200 }
		);
	  }
	  return new Response(
		JSON.stringify({ message: "Report not found or already deleted" }),
		{ status: 404 }
	  );
	} catch (error) {
	  return new Response(
		JSON.stringify({ message: "Internal server error" }),
		{ status: 500 }
	  );
	}
  }