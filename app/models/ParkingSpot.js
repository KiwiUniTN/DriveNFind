import mongoose from 'mongoose';

const ParkingSpotSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: {
    type: String,
    enum: ['free', 'occupied'],
    required: true,
  },
  category: {
    type: String,
    enum: ['A pagamento', 'Elettrico', 'Disabile', 'Libero'],
    required: true,
  },
});

export default mongoose.models.ParkingSpot || mongoose.model('ParkingSpot', ParkingSpotSchema);
