// app/api/checkConnection/route.js
import { connectToDB } from "@/app/lib/database"; // Named import

export async function GET(request) {
  try {
    await connectToDB();

    return new Response(
      JSON.stringify({ message: "Connected successfully to the DriveNFind Cluster and DriveNFind database" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Connection error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to connect to DriveNFind DB", error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
