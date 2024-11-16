import { connectToDB } from '../../../lib/database';
import User from '../../../models/User';
import { authorize, authorizeRole } from '../../../middleware/auth';

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
