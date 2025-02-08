import { authorize } from "@/app/middleware/auth";
import Report from "@/app/models/Report";
import { connectToDB } from "../../../lib/database";
import { Readable } from "stream";
import { Buffer } from "buffer";
import cloudinary from "@/app/lib/cloudinary";
//TODO:modificarfe la documentazione
// se il reportId è presente ritorno il report con quell'id altrimenti ritorno tutti i report dell'utente se baseuser. Se admin ritorno tutti i report
export async function GET(req) {
	try {
		const url = new URL(req.url);
		const id = url.searchParams.get("reportId");
    
		await connectToDB();
		const userAuth =  authorize(req);
		if (!userAuth.authorized) {
			return userAuth.response;
		}
    if (id) {
      // if id is present return the report with that id
      const report = await Report.findById(id);
      if (!report) {
        throw new Error("Report not found");
      } else {
        if (report.username != userAuth.user.username) {
          throw new Error("A user can't access report made by other user")
        }
        return new Response(JSON.stringify(report), { status: 200 });
      }
    }
    if (userAuth.user.role === "admin") {
      // admin can see all reports
      const reports = await Report.find();
      return new Response(JSON.stringify(reports), { status: 200 });  
		} 

    // base users can see only their
    const reports = await Report.find({ username: userAuth.user.username });
    if (!reports || reports.length === 0) {
      throw new Error("No reports found");
    } else {
      return new Response(JSON.stringify(reports), { status: 200 });
    }
		
	} catch (error) {
		return new Response(
			JSON.stringify({ "message": error.message  }),
			{ status: 500 }
		);
	}
}
/* modifica del report dato reportId come parametro e nuovi dati della segnalazione nel body della richiesta 
NB. i base User possono solo modificare i campi description e imageUrl 
    gli admin possono modificare solamente lo status*/
 




export async function PATCH(req) {
	try {
		const url = new URL(req.url);
		const id = url.searchParams.get("reportId");
		await connectToDB();
		const userAuth = authorize(req);

		if (!userAuth.authorized) {
			return userAuth.response;
		}

		const report = await Report.findById(id);
		if (!report) {
			return new Response(JSON.stringify({ message: "Report not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		const body = await req.formData();
		let updateFields = {};

		// Se l'utente è un baseuser, può modificare solo `description` e `imageUrl`
		if (userAuth.user.role === "baseuser") {
			if (body.has("status")) {
				return new Response(
					JSON.stringify({ message: "Base users can't modify the status" }),
					{ status: 403, headers: { "Content-Type": "application/json" } }
				);
			}

			// Gestione caricamento immagine su Cloudinary
			if (body.has("image")) {
				const imageFile = body.get("image");
				if (imageFile && imageFile instanceof Blob) {
					try {
						const arrayBuffer = await imageFile.arrayBuffer();
						const buffer = Buffer.from(arrayBuffer);
						const stream = Readable.from(buffer);

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

						updateFields.imageUrl = uploadResponse.secure_url;
					} catch (uploadError) {
						console.error("Image upload error:", uploadError);
						return new Response(
							JSON.stringify({
								message: "Image upload failed",
								error: uploadError.message,
							}),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}
				}
			}

			// Aggiorna anche la descrizione se presente
			if (body.has("description")) {
				updateFields.description = body.get("description");
			}

			// Se l'utente è un admin, può modificare solo lo `status`
		} else if (userAuth.user.role === "admin") {
			if (body.has("description") || body.has("image")) {
				return new Response(
					JSON.stringify({
						message: "Admins can't modify the description and imageUrl",
					}),
					{ status: 403, headers: { "Content-Type": "application/json" } }
				);
			}

			if (!body.has("status")) {
				return new Response(JSON.stringify({ message: "Status is required" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}

			updateFields.status = body.get("status");
		}

		// Esegui l'update nel database
		const updatedReport = await Report.findByIdAndUpdate(id, updateFields, {
			new: true,
		});

		if (!updatedReport) {
			return new Response(
				JSON.stringify({ message: "Update failed, report not found" }),
				{ status: 404, headers: { "Content-Type": "application/json" } }
			);
		}

		return new Response(
			JSON.stringify({
				message: "Report updated successfully",
				report: updatedReport,
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("Error updating report:", error);
		return new Response(JSON.stringify({ message: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
