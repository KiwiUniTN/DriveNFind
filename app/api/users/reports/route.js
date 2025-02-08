import { authorize, authorizeRole } from "@/app/middleware/auth";
import Report from "@/app/models/Report";
import { connectToDB } from "../../../lib/database";
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
    } else {
      const report = await Report.findById(id);
      if (!report) {
        return new Response({ message: 'Report not found' }, { status: 404 });
      } else {
        const body = await req.json();
        if (userAuth.user.role === "baseuser") {
          if (body.status) {
            return Response.json({ message: 'Base users can\'t modify the status' }, { status: 403 });
          }
          const updatedReport = await Report.findByIdAndUpdate(id, body, {
            new: true,
          });
          return new Response({message: JSON.stringify(updatedReport)}, { status: 200 });
        } else if (userAuth.user.role === "admin") {
          if (body.description || body.imageUrl) {
            return new Response({message: "Admins can't modify the description and imageUrl"}, { status: 403 });
          }
          if (!body.status) {
            return new Response ({message: "Status is required"}, { status: 400 });
          } else {
          const updatedReport = await Report.findByIdAndUpdate(id, body, {
							new: true,
						});
            return new Response({message: JSON.stringify(updatedReport)}, { status: 200 });
          }
        }
      }
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ "message": error.message }),
      { status: 500 }
    );
  }
}