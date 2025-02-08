import { authorize, authorizeRole } from "../../../../app/middleware/auth";
import Report from "../../../../app/models/Report";
import { connectToDB } from "../../../../app/lib/database";
import { SERVER_PROPS_GET_INIT_PROPS_CONFLICT } from "next/dist/lib/constants";
//TODO:modificarfe la documentazione
// se il reportId è presente ritorno il report con quell'id altrimenti ritorno tutti i report dell'utente se baseuser. Se admin ritorno tutti i report
export async function GET(req) {
  const url = new URL(req.url);
  const id = url.searchParams.get("reportId");
  const userAuth = authorize(req);

  try {
    await connectToDB();
    if (!userAuth.authorized) {
      return userAuth.response;
    }

    if (id) {
      // Return the report with the specified ID
      const report = await Report.findById(id);
      if (!report) {
        return new Response(
          JSON.stringify({ message: "Report not found" }),
          { status: 404 }
        );
      }
      if (report.username !== userAuth.user.username) {
        return new Response(
          JSON.stringify({ message: "A user can't access a report made by another user" }),
          { status: 403 }
        );
      }
      return new Response(JSON.stringify(report), { status: 200 });
    }

    if (userAuth.user.role === "admin") {
      // Admin can view all reports
      const reports = await Report.find();
      return new Response(JSON.stringify(reports), { status: 200 });
    }
    
    // Base users can only view their reports
    // console.log(userAuth.user.username);
    const reports = await Report.find({ username: userAuth.user.username });
    if (!reports || reports.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reports found" }),
        { status: 404 }
      );
    }
    return new Response(JSON.stringify(reports), { status: 200 });

  } catch (error) {
    // console.error("Error fetching reports:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
/* modifica del report dato reportId come parametro e nuovi dati della segnalazione nel body della richiesta 
NB. i base User possono solo modificare i campi description e imageUrl 
    gli admin possono modificare solamente lo status*/
    export async function PATCH(req) {
      const url = new URL(req.url);
      const id = url.searchParams.get("reportId");
    
      if (!id) {
        return new Response(
          JSON.stringify({ message: "Missing required report ID" }),
          { status: 400 }
        );
      }
      const userAuth = authorize(req);
    
      try {
        await connectToDB();
    
        if (!userAuth.authorized) {
          return userAuth.response;
        }
    
        const report = await Report.findById(id);
        if (!report) {
          return new Response(
            JSON.stringify({ message: "Report not found" }),
            { status: 404 }
          );
        }
    
        const body = await req.json();
    
        if (userAuth.user.role === "baseuser") {
          if (body.status) {
            return new Response(
              JSON.stringify({ message: "Base users can't modify the status" }),
              { status: 403 }
            );
          }
          
          const updatedReport = await Report.findByIdAndUpdate(id, body, {
            new: true,
          });
          return new Response(
            JSON.stringify({ message: "Report updated", report: updatedReport }),
            { status: 200 }
          );
        } else if (userAuth.user.role === "admin") {
          if (body.description || body.imageUrl) {
            return new Response(
              JSON.stringify({ message: "Admins can't modify the description and imageUrl" }),
              { status: 403 }
            );
          }
          if (!body.status) {
            return new Response(
              JSON.stringify({ message: "Status is required" }),
              { status: 400 }
            );
          }
    
          const updatedReport = await Report.findByIdAndUpdate(id, body, {
            new: true,
          });
          return new Response(
            JSON.stringify({ message: "Report updated", report: updatedReport }),
            { status: 200 }
          );
        }
    
      } catch (error) {
        return new Response(
          JSON.stringify({ message: "Internal server error" }),
          { status: 500 }
        );
      }
    }
        