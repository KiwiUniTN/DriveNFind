// app/api/checkConnection/route.js
import { connectToDB } from "@/app/lib/database"; // Named import

export async function GET(request) {
  try {
    await connectToDB(); // Call the function to connect to the database

    return new Response(
      JSON.stringify({ message: "Connected successfully to sample_mflix database" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Connection error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to connect to sample_mflix database", error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
