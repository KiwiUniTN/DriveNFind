import { connectToDB } from '../../../lib/database';
import User from '../../../models/User';
import { authorize, authorizeRole } from '../../../middleware/auth';
import bcrypt from 'bcrypt'; 

export async function GET(req) {
  const authResult = await authorize(req);

  if (!authResult.authorized) {
    return authResult.response; // Return the error response from the middleware
  }
  //Destrutturare l'oggetto user per ottenere username e ruolo
  const { user } = authResult;
  const { username, role } = user;

  console.log(username, role); // Logs username and role for debugging

  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const getAllFlag = 'true' === searchParams.get('getAll');
    console.log(getAllFlag)
    let baseUsers;

    if (getAllFlag && getAllFlag==true && role == 'admin') {
      baseUsers = await User.findByUsername(username);
      console.log('ciao')
    } else if ((!getAllFlag || (getAllFlag && getAllFlag == false)) && role == 'admin') {
      baseUsers = await User.findByRole('admin');
      console.log('hey')
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
    const { username, password, role } = await req.json();
  
    // Basic input validation
    if (!username || !password || !role) {
      return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }
  
    if (role !== 'admin') {
      return Response.json({ message: 'Only admin role can be created via this endpoint' }, { status: 400 });
    }
  
    try {
      // Check if the username already exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return Response.json({ message: 'Username already taken' }, { status: 400 });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10
  
      // Create a new user with the 'admin' role
      const newUser = new User({
        username,
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