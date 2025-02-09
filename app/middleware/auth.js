import jwt from 'jsonwebtoken';

export const authorize = (req) => {
  const headers = new Headers(req.headers);
  const token = headers.get('authorization')?.split(' ')[1];
  // const token = req.headers?.authorization?.split(' ')[1];
  // console.log('Authorization token:', token);
  // console.log(token)
  if (!token || token === undefined) {
		// If no token is provided, return an error response
    // console.error("No authorization token provided");
		return {
			authorized: false,
			response: Response.json(
				{ message: "Authorization token required" },
				{ status: 401 }
			),
		};
	}

  console.log(process.env.JWT_SECRET);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { authorized: true, user: decoded };
  } catch (error) {
    // If the token is invalid, return an error response
    return { authorized: false, response: Response.json({ message: 'Invalid token' }, { status: 401 }) };
  }
}

export function authorizeRole(allowedRoles) {
  return async (req) => {
  
    const authResult = authorize(req);
    // console.log(authResult)
    if (!authResult.authorized) {
      // If the user is not authorized, return the error response
      return authResult;
    }

    const { user } = authResult;
    // console.log(user.role)
    // console.log(allowedRoles)
    // console.log(!allowedRoles.includes(user.role))
    if (!allowedRoles.includes(user.role)) {
      // If the user does not have the required role, return an error response
      return { authorized: false, response: Response.json({ message: 'Forbidden - insufficient permissions' }, { status: 403 }) };
    }

    // If the user is authorized and has the required role, return the user
    return { authorized: true, user };
  };
}


// export function authorizeRole(allowedRoles) {
//   return async (req) => {
//     const token = req.headers.get('authorization')?.split(' ')[1];
//     console.log('Authorization token:', token);
//     if (!token) {// If no token is provided, return an error response
//       return { authorized: false, response: Response.json({ message: 'Authorization token required' }, { status: 401 }) };
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       if (!allowedRoles.includes(decoded.role)) {// If the user does not have the required role, return an error response
//         return { authorized: false, response: Response.json({ message: 'Forbidden - insufficient permissions' }, { status: 403 }) };
//       }

//       return { authorized: true, user: decoded };// If the user is authorized, return the decoded token
//     } catch (error) {
//       return { authorized: false, response: Response.json({ message: 'Invalid token' }, { status: 401 }) };
//     }
//   };
// }


