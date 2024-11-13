import jwt from 'jsonwebtoken';

export function authorizeRole(allowedRoles) {
  return (req, res, next) => {
    //Prendo il token dall'header della richiesta
    const token = req.headers.authorization?.split(' ')[1];
    //Se non c'è il token, rispondo con un errore 401
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    //Verifico il token
    try {
      //Decodifico il token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //Se il ruolo dell'utente non è tra quelli consentiti, rispondo con un errore 403
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
      }
      //Altrimenti, attacco le informazioni dell'utente alla richiesta e passo alla funzione successiva
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
}
