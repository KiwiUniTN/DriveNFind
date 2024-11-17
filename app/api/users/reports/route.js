import { authorizeRole } from "@/app/middleware/auth";
import Report from "@/app/models/Report";
import { connectToDB } from "../../../lib/database";
//TODO:modificarfe la documentazione
// se il reportId è presente ritorno il report con quell'id altrimenti ritorno tutti i report dell'utente se baseuser. Se admin ritorno tutti i report

export async function GET(req) {
	try {
		const url = new URL(req.url);
		const id = url.searchParams.get("reportId");
		await connectToDB();
		const userAuth = await authorizeRole(["baseuser"])(req);
    console.log(userAuth);
		if (id) {
			// if id is present return the report with that id
			const report = await Report.findById(id);
			if (!report) {
				throw new Error("report not found");
			} else {
				return new Response(JSON.stringify(report), { status: 200 });
			}
		}

		if (!userAuth.authorized) {
			console.log("sono qui");
			throw new Error("you are not authorized to access this resource");
		} else if (userAuth.user.role === "admin") {
			console.log("sono qui1");

			throw new Error("admin can't access the single person reports");
		} else {
			console.log("sono qui2");
      console.log(userAuth.user.username);
      await connectToDB();
			const reports = await Report.find({ username: userAuth.user.username });
      console.log(reports);
			if (!reports || reports.length === 0) {
				throw new Error("no reports found");
			} else {
				return new Response(JSON.stringify(reports), { status: 200 });
			}
		}
	} catch (error) {
		return new Response(
			JSON.stringify({ "error in the request of the report": error }),
			{ status: 500 }
		);
	}
}
