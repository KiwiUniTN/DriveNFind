import { connectToDB } from '../../../lib/database';
import User from '../../../models/User';
import { authorize } from '../../../middleware/auth';
import bcrypt from 'bcrypt'; 
import { clerkClient } from "@clerk/nextjs";

export async function GET(req) {
  const authResult = authorize(req);

  if (!authResult.authorized) {
    return authResult.response; // Return the error response from the middleware
  }
  //Destrutturare l'oggetto user per ottenere username e ruolo
  const { user } = authResult;
  const { username, role } = user;
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const username_to_search = searchParams.get('username');
    
    let baseUsers;

    if (username_to_search && role == 'admin') {
      baseUsers = await User.findByUsername(username_to_search,{password:0});
    } else if (!username_to_search && role == 'admin') {
      baseUsers = await User.findByRole('baseuser',{password:0});
    } else if (!username_to_search && role == 'baseuser') {
      baseUsers = await User.findByUsername(username,{password:0});
    }else if (username_to_search && role == 'baseuser') {
      return Response.json({ message: 'Forbidden - insufficient permissions' }, { status: 403 })
    }

    if (!baseUsers) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(baseUsers, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function POST(req) {
  // clerk sync
   try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Verify Clerk token
    const session = await clerkClient.sessions.verifyToken(token);
    if (!session) return Response.json({ error: "Invalid token" }, { status: 401 });

    const userId = session.userId;
    const clerkUser = await clerkClient.users.getUser(userId);

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return Response.json({ error: "Email not found" }, { status: 400 });

    await connectToDB();

    // Check if user exists in your DB
    const existingUser = await User.findByUsername(email);
    if (existingUser) {
      return Response.json({ message: "User already inserted with Clerk" }, { status: 200 });
    }

    // Generate a random secure password (not used for login)
    const hashedPassword = await bcrypt.hash(userId, 10);

    // Create new user
    const newUser = new User({ username: email, password: hashedPassword, role: "baseuser" });
    await newUser.save();

    return Response.json({ message: "User created successfully", user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error syncing user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  };
}

export async function DELETE(req) {
  try {
    const { username: targetUsername } = await req.json(); // Get the username to delete from the request body
    console.log(targetUsername)
    // Authorize the request
    const authResult = await authorize(req); // Assume this returns { authorized, user }
    if (!authResult.authorized) {
      return authResult.response; // Return error response if unauthorized
    }

		const { user } = authResult; // The authenticated user
		const { username: currentUsername, role: currentUserRole } = user;

		await connectToDB();

		// Allow base users to delete their own account
		if (currentUserRole === "baseuser" && targetUsername !== null) {
			return Response.json(
				{ message: "You can only delete your own account." },
				{ status: 403 }
			);
		}

		// Allow admins to delete any baseuser
		if (currentUserRole === "admin") {
			if (!targetUsername) {
				return Response.json(
					{ message: "You don't provide any username to delete" },
					{ status: 403 }
				);
			}
			const userToDelete = await User.findOne({ username: targetUsername });

			if (!userToDelete) {
				return Response.json({ message: "User not found." }, { status: 404 });
			}

			if (userToDelete.role !== "baseuser") {
				return Response.json(
					{ message: "Admins can only delete base users." },
					{ status: 403 }
				);
			}

			// Delete the user
			await User.deleteOne({ username: targetUsername });

			return Response.json(
				{ message: `User ${targetUsername} deleted successfully.` },
				{ status: 200 }
			);
		}

		// If the current user is not an admin and the request is invalid
		if (currentUserRole === "baseuser") {
			// Allow the user to delete their own account
			await User.deleteOne({ username: currentUsername });
			return Response.json(
				{ message: "Your account has been deleted successfully." },
				{ status: 200 }
			);
		}

		return Response.json(
			{ message: "Operation not allowed." },
			{ status: 403 }
		);
	} catch (error) {
		console.error("Error processing DELETE request:", error);
		return Response.json(
			{ message: "Internal server error." },
			{ status: 500 }
		);
	}
}