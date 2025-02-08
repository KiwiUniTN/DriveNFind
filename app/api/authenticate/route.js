    import jwt from 'jsonwebtoken';
    import bcrypt from 'bcrypt';
    import { connectToDB } from '../../lib/database'
    import User from '../../models/User';
    export async function POST(req) {
        //Prendo le credenziali dall'oggetto req
        const { username, password } = await req.json();
        console.log("Received request body:", { username, password });
        //Se manca l'username o la password, rispondo con un errore 400
        if (!username || !password) {
            return new Response(
                JSON.stringify({ message: 'Username and password are required.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        //Cerco l'utente nel database
        try {
            //Mi connetto al database
            await connectToDB();
            //Cerco l'utente con lo stesso username (assumiamo che l'username sia univoco)
            const user = await User.findOne({ username });
            //Se l'utente non esiste, rispondo con un errore 401
            if (!user) {
                return new Response(
                    JSON.stringify({ message: 'Invalid username or password, user not present.' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }
            //Controllo se la password è corretta utilizzando la password in chiaro passata dall'utente su HTTPS e la password hashata con bcrypt salvata nel database
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            //Se la password non è corretta, rispondo con un errore 401
            if (!isPasswordCorrect) {
                return new Response(
                    JSON.stringify({ message: 'Invalid username or password.' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }

            //Genero un token JWT con l'ID dell'utente e il ruolo
            const token = jwt.sign(
							{
								userId: user._id,
								username: user.username,
								role: user.role,
							},
							//Utilizzo la chiave segreta per firmare il token nel file .env.local creabile con openssl rand -hex 64
							process.env.JWT_SECRET,
							//Imposto la scadenza del token a 1 ora (questo possiamo cambiarlo a nostro piacimento)
							{ expiresIn: process.env.JWT_EXPIRY }
						);
            //Rispondo con il token
            return new Response(
                JSON.stringify({ token }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            return new Response(
                JSON.stringify({ message: 'Internal server error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }