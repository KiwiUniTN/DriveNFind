import mongoose from "mongoose";
import { connectToDB, setIsConnectedForTesting } from "../../app/lib/database"; // Assuming your code is in database.js

jest.mock('mongoose');

describe('connectToDB', () => {
  it('should return an error if MONGODB_URI is missing', async () => {
    delete process.env.MONGODB_URI;

    const result = await connectToDB();

    expect(result.success).toBe(false);
    expect(result.message).toBe('MONGODB_URI is missing in environment variables');
  });

  it('should return a success message if already connected', async () => {
    process.env.MONGODB_URI = 'mongodb://valid-uri';
    setIsConnectedForTesting(true);
    mongoose.connect.mockResolvedValueOnce({});
    const result = await connectToDB();

    expect(result.success).toBe(true);
    expect(result.message).toBe('Already connected to the database');
  });

  it('should successfully connect to the database if MONGODB_URI is set and not already connected', async () => {
    process.env.MONGODB_URI = 'mongodb://valid-uri';
    setIsConnectedForTesting(false);
    mongoose.connect.mockResolvedValue('Database connected successfully!');

    const result = await connectToDB();

    expect(result.success).toBe(true);
    expect(result.message).toBe('Database connected successfully!');
  });

  it('should return an error if the connection fails', async () => {
    process.env.MONGODB_URI = 'mongodb://valid-uri';

    setIsConnectedForTesting(false);
    mongoose.connect.mockRejectedValueOnce(new Error('Connection failed'));

    const result = await connectToDB();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Database connection failed');
  });
});
