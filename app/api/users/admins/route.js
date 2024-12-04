import { connectToDB } from '../../../lib/database';
import User from '../../../models/User';
import { authorize, authorizeRole } from '../../../middleware/auth';
import bcrypt from 'bcrypt'; 

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
    const getAllFlag = 'true' === searchParams.get('getAll');
    let baseUsers;

    if (!getAllFlag && role == 'admin') {
      baseUsers = await User.findByUsername(username,{password:0});
    } else if (getAllFlag && role == 'admin') {
      baseUsers = await User.findByRole('admin',{password:0});
    } else if (role == 'baseuser') {
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
    // Check for admin authorization
    const authResult = await authorizeRole(['admin'])(req);
  
    if (!authResult.authorized) {
      return authResult.response; // Return error response if user is not authorized
    }
  
    // Parse the JSON body
    const { username:newUsername, password } = await req.json();
  
    // Basic input validation
    if (!newUsername || !password) {
      return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }
  await connectToDB();
    try {
      // Check if the username already exists
      
      const existingUser = await User.findByUsername(newUsername);
      if (existingUser) {
        return Response.json({ message: 'Username already taken' }, { status: 400 });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10
      
      // Create a new user with the 'admin' role
      const newUser = new User({
        username: newUsername,
        password: hashedPassword,
        role: 'admin', // Set the role to 'admin'
      });
        
      // Save the new user to the database
      await newUser.save();
      // Return the success response
      return Response.json({ message: 'Admin user created successfully', user: newUser }, { status: 201 });
    } catch (error) {
      console.error('Error creating admin user:', error);
      return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
  }

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUsername = searchParams.get('targetUsername');

    // Authorize the request
    const authResult = await authorizeRole(['admin'])(req); // Assume this returns { authorized, user }
    if (!authResult.authorized) {
      return authResult.response; // Return error response if unauthorized
    }

    const { user } = authResult; // The authenticated user
    const { username: currentUsername} = user;

    await connectToDB();

    // Admins can delete their own account
    if (targetUsername === null) {
      // Check if there are other admins before deletion
      const remainingAdmins = await User.countDocuments({ role: 'admin' });
      if (remainingAdmins <= 1) {
        return Response.json(
          { message: 'At least one admin must remain in the system.' },
          { status: 403 }
        );
      }

      // Delete the admin's own account
      await User.deleteOne({ username: currentUsername });
      return Response.json(
        { message: 'Your account has been deleted successfully.' },
        { status: 200 }
      );
    }

    // Fetch the user to delete
    const userToDelete = await User.findOne({ username: targetUsername });

    if (!userToDelete) {
      return Response.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    // Admins can delete other admins
    if (userToDelete.role === 'admin') {
      // Delete the target admin
      await User.deleteOne({ username: targetUsername });
      return Response.json(
        { message: `Admin user ${targetUsername} deleted successfully.` },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error processing DELETE request:', error);
    return Response.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}