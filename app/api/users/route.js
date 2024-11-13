import { authorizeRole } from '../../middleware/auth.js';

export async function GET(req) {
  const authorizationResult = await authorizeRole(['admin'])(req);
  
  // If authorizationResult is a Response, return it as an error
  if (authorizationResult instanceof Response) {
    return authorizationResult; // Error response (401 or 403)
  }

  // If authorization was successful, proceed with the handler
  return new Response(JSON.stringify({ message: 'Success' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
