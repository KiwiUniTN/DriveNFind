// app/api/verify-role/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
	const token = request.headers.get("authorization")?.split(" ")[1];
	const allowedRoles = await request.json();

	if (!token) {
		return NextResponse.json(
			{ message: "Authorization token required" },
			{ status: 401 }
		);
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const authorized = allowedRoles.includes(decoded.role);

		if (!authorized) {
			return NextResponse.json(
				{ message: "Forbidden - insufficient permissions" },
				{ status: 403 }
			);
		}

		return NextResponse.json({ authorized: true, user: decoded });
	} catch (error) {
		return NextResponse.json({ message: "Invalid token" }, { status: 401 });
	}
}
