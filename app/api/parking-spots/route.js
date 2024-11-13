import { connectToDB } from '../../lib/database';
import ParkingSpot from '../../models/ParkingSpot';

export async function GET(req, { params }) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const lat = searchParams.get('lat');
  const long = searchParams.get('long');
  const disponibilita = searchParams.get('disponibilita');
  const regolamento = searchParams.get('regolamento');

  try {
    if (id) {
      const parkingSpot = await ParkingSpot.findOne({ id: parseInt(id) });
      if (!parkingSpot) return new Response(JSON.stringify({ message: 'Parking spot not found' }), { status: 404 });
      return new Response(JSON.stringify(parkingSpot), { status: 200 });
    }

    let query = {};

    if (disponibilita) {
      query.disponibilita = disponibilita;
    }

    if (regolamento) {
      query.regolamento = regolamento;
    }


    //Se le API fornisce meno di 4 parcheggi significa che non ci sono 4 parcheggi LIBERI in un raggio di 5km
    if (lat && long) {
      query.disponibilita = 'libero';
      const nearestSpots = await ParkingSpot.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [parseFloat(long), parseFloat(lat)] },
            distanceField: 'distance',
            spherical: true,
            maxDistance:5000  
          },
        },
        { $match: query },
        { $limit: 4 },
      ]);
      return new Response(JSON.stringify(nearestSpots), { status: 200 });
    }

    const parkingSpots = await ParkingSpot.find(query);
    return new Response(JSON.stringify(parkingSpots), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Server error', error: error.message }), { status: 500 });
  }
}
