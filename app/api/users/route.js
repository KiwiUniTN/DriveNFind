import { connectToDB } from '../../lib/database';
import User from '../../models/User';
import { authorize, authorizeRole } from '../../middleware/auth';
import bcrypt from 'bcrypt';

export async function GET(req) {
  const authResult = await authorizeRole(['admin'])(req);

  if (!authResult.authorized) {
    return authResult.response; // Return the error response from the middleware
  }
  //Destrutturare l'oggetto user per ottenere username e ruolo
  //const { user } = authResult;
  //const { username, role } = user;

  // console.log(username, role); // Logs username and role for debugging

  try {
    await connectToDB();
    const users = await User.find({}); // Fetch users from the database

    return Response.json(users, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  // Parse request body
  const { username: targetUsername, newPassword, newRole } = await req.json();
  
  // Authorize the user
  const authResult = await authorize(req);
  if (!authResult.authorized) {
    return authResult.response; // Unauthorized or forbidden
  }

  const { user } = authResult; // The authenticated user
  const { username: currentUsername, role: currentUserRole } = user;

  try {
    await connectToDB();

    // If updating password (for self only)
    if (newPassword) {
      if (targetUsername!=null) {
        return Response.json(
          { message: 'You can only change your own password.' },
          { status: 403 }
        );
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the password in the database
      await User.updateOne({ username: currentUsername }, { password: hashedPassword });

      return Response.json(
        { message: 'Password updated successfully.' },
        { status: 200 }
      );
    }

    // If updating the role (admin only)
    if (newRole) {
      if (currentUserRole !== 'admin') {
        return Response.json(
          { message: 'Only admins can change user roles.' },
          { status: 403 }
        );
      }

      // Validate the provided role
      if (!['baseuser', 'admin'].includes(newRole)) {
        return Response.json(
          { message: 'Invalid role provided. Allowed roles: baseuser, admin.' },
          { status: 400 }
        );
      }

      // Update the user's role in the database
      const updatedUser = await User.findOneAndUpdate(
        { username: targetUsername },
        { role: newRole },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return Response.json(
          { message: 'User not found.' },
          { status: 404 }
        );
      }

      return Response.json(
        { message: `Role updated successfully for ${targetUsername}.`, user: updatedUser },
        { status: 200 }
      );
    }

    // If no valid operation is specified
    return Response.json(
      { message: 'No valid operation specified.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing PATCH request:', error);
    return Response.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}