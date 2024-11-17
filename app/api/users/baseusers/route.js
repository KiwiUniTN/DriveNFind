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
    const username_to_search = searchParams.get('username');
    
    let baseUsers;

    if (username_to_search && role == 'admin') {
      baseUsers = await User.findByUsername(username_to_search);
    } else if (!username_to_search && role == 'admin') {
      baseUsers = await User.findByRole('baseuser');
    } else if (!username_to_search && role == 'baseuser') {
      
      baseUsers = await User.findByUsername(username);
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
  // Parse the JSON body
  const { username, password, role } = await req.json();

  // Basic input validation
  if (!username || !password || !role) {
    return Response.json({ message: 'Missing required fields' }, { status: 400 });
  }

  if (role !== 'baseuser') {
    return Response.json({ message: 'Only baseuser role is allowed for new users' }, { status: 400 });
  }

  try {
    // Check if the username already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return Response.json({ message: 'Username already taken' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role: 'baseuser', // Ensure the role is set to 'baseuser'
    });

    // Save the new user to the database
    await newUser.save();

    // Return the success response
    return Response.json({ message: 'User created successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
