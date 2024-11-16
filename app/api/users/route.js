import { connectToDB } from '../../lib/database';
import User from '../../models/User';
import { authorizeRole } from '../../middleware/auth';

export async function GET(req) {
  const authResult = await authorizeRole(['admin'])(req);

  if (!authResult.authorized) {
    return authResult.response; // Return the error response from the middleware
  }
  //Destrutturare l'oggetto user per ottenere username e ruolo
  //const { user } = authResult;
  //const { username, role } = user;

  console.log(username, role); // Logs username and role for debugging

  try {
    await connectToDB();
    const users = await User.find({}); // Fetch users from the database

    return Response.json(users, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
