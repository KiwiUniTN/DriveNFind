import { authorizeRole } from "@/app/middleware/auth";
import Report  from "@/app/models/Report";
/* crea un report dato nel body della richiesta 
    "parkingLotId": id del parcheggio,
    "description": "descrizione del problema",
    "status": "In sospeso",
    "imageUrl": "path/to/image" */
export async function POST(req, res) {
    // Authenticate user based on the provided token
    let userAuth;
    const body = await req.json();
    try {
        userAuth = await authorizeRole(["baseuser"])(req);
        if (userAuth.authorized !== true) {
					throw new Error("Unauthorized");
				}
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 401 });
    }
    if (userAuth.user.role === "admin") {
        return new Response(JSON.stringify({ message: 'Admin users cannot create reports' }), { status: 403 });
    }
    
    const newReport = {
			username: userAuth.user.username,
			parkingLotId: body.parkingLotId,
			description: body.description,
			status: body.status,
			imageUrl: body.imageUrl,
		};
	
     try {
			const createdReport = await Report.create(newReport);
			return new Response(JSON.stringify(createdReport), { status: 201 });
		} catch (error) {
			return new Response(
				JSON.stringify({ message: `Report creation failed:${error.message}` }),{ status: 500 }
			);
		}
}

export async function PATCH(req, res) {
    const { reportId } = req.query;
    const { description, imageUrl } = req.body;

    // Authenticate user based on the provided token
    const isUser = await authorizeRole(["user"])(req);
    if (isUser !== true) return res.status(401).json({ error: "Unauthorized" });

    if (req.user.role === "admin") {
        return res.status(403).json({ error: "Admin users cannot update reports" });
    }

    if (!reportId) {
        return res.status(400).json({ error: "Report ID is required" });
    }

    const updatedData = { description, imageUrl };
    const updatedReport = await Report.findByIdAndUpdate(reportId, updatedData, { new: true });
    if (updatedReport) {
        return res.status(200).json(updatedReport);
    } else {
        return res.status(404).json({ error: "Report not found or update failed" });
    }
}

export async function DELETE(req, res) {
    const { reportId } = req.query;

    // Authenticate user based on the provided token
    const isUser = await authorizeRole(["user"])(req);
    if (isUser !== true) return res.status(401).json({ error: "Unauthorized" });

    if (req.user.role === "admin") {
        return res.status(403).json({ error: "Admin users cannot delete reports" });
    }

    if (!reportId) {
        return res.status(400).json({ error: "Report ID is required" });
    }

    const deletionSuccess = await Report.findByIdAndDelete(reportId);
    if (deletionSuccess) {
        return res.status(204).end();
    } else {
        return res.status(404).json({ error: "Report not found or deletion failed" });
    }
}