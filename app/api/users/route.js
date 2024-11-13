import { connectToDB } from '../../lib/database';
import User from '../../models/User';
import { authorizeRole } from '../../middleware/auth';

export async function GET(req) {
    
    
    const isAuthorized = await authorizeRole(['admin'])(req);
    console.log(isAuthorized)
    if (isAuthorized !== true) return isAuthorized;  // If authorization fails, return the error response

  try {
    await connectToDB();
    const users = await User.find({});
    
    return Response.json(users, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
