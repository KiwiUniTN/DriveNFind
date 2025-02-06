import { connectToDB } from '../../lib/database';
import ParkingSpot from '../../models/ParkingSpot';
export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const lat = searchParams.get('lat');
  const long = searchParams.get('long');
  const disponibilita = searchParams.get('disponibilita');
  const regolamento = searchParams.get('regolamento');
  const disabile = searchParams.get('disabile');
  const alimentazione = searchParams.get('alimentazione');
  const tipologia = searchParams.get('tipologia');

  try {
    if (id) {
      const parkingSpot = await ParkingSpot.findOne({ id: parseInt(id) });
      if (!parkingSpot)
        return new Response(JSON.stringify({ message: 'Parking spot not found' }), { status: 404 });
      return new Response(JSON.stringify(parkingSpot), { status: 200 });
    }

    let query = {};

    let orConditions = [];

    if (disponibilita) {
      const disponibilitaArray = disponibilita.split(',');
      orConditions.push({ disponibilita: { $in: disponibilitaArray } });
    }
    if(tipologia){
      const tipologiaArray = tipologia.split(',');
      orConditions.push({ tipologia: { $in: tipologiaArray } });
    }

    if (regolamento) {
      const regolamentoArray = regolamento.split(',');
      orConditions.push({ regolamento: { $in: regolamentoArray } });
    }

    if (disabile) {
      orConditions.push({ disabile: disabile === 'true' });
    }

    if (alimentazione) {
      const alimentazioneArray = alimentazione.split(',');
      orConditions.push({ alimentazione: { $in: alimentazioneArray } });
    }

    if (orConditions.length > 0) {
      query.$and = orConditions;
    }

    // Se le API forniscono meno di 4 parcheggi significa che non ci sono 4 parcheggi LIBERI in un raggio di 1km
    if (lat && long) {
      query.disponibilita = 'libero';
      const nearestSpots = await ParkingSpot.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [parseFloat(long), parseFloat(lat)] },
            distanceField: 'distance',
            spherical: true,
            maxDistance: 1000,
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


export async function PATCH(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const newDisponibilita = searchParams.get('disponibilita');

  if (!id || !newDisponibilita) {
    return new Response(JSON.stringify({ message: 'Missing id or disponibilita' }), { status: 400 });
  }

  try {
    const updatedParkingSpot = await ParkingSpot.findOneAndUpdate(
      { _id: id },
      { disponibilita: newDisponibilita },
      { new: true }
    );

    if (!updatedParkingSpot) {
      return new Response(JSON.stringify({ message: 'Parking spot not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedParkingSpot), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Server error', error: error.message }), { status: 500 });
  }
}
