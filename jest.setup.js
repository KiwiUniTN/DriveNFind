global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
import dotenv from 'dotenv';

// Carica il file `.env.test`
dotenv.config({ path: '.env.test' });