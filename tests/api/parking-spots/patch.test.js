import { PATCH } from '../../../app/api/parking-spots/route';
import { connectToDB } from '../../../app/lib/database';
import ParkingSpot from '../../../app/models/ParkingSpot';

jest.mock("../../../app/lib/database");
jest.mock('../../../app/models/ParkingSpot');

describe('PATCH /api/parking-spots', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if id or disponibilita is missing', async () => {
    const req = { url: 'http://localhost/api/parking-spots?id=123' }; // missing disponibilita
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Missing id or disponibilita');
  });

  it('should return 404 if parking spot is not found', async () => {
    ParkingSpot.findOneAndUpdate.mockResolvedValueOnce(null);

    const req = { url: 'http://localhost/api/parking-spots?id=123&disponibilita=libero' };
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe('Parking spot not found');
  });

  it('should return 200 and update disponibilita successfully', async () => {
    const mockUpdatedSpot = { _id: '123', disponibilita: 'occupato' };
    ParkingSpot.findOneAndUpdate.mockResolvedValueOnce(mockUpdatedSpot);

    const req = { url: 'http://localhost/api/parking-spots?id=123&disponibilita=occupato' };
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockUpdatedSpot);
  });

  it('should return 500 if a server error occurs', async () => {
    ParkingSpot.findOneAndUpdate.mockRejectedValueOnce(new Error('Database error'));

    const req = { url: 'http://localhost/api/parking-spots?id=123&disponibilita=libero' };
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('Server error');
    expect(data.error).toBe('Database error');
  });
  
});
