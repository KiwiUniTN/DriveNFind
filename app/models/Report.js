import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  username: { type: String, ref: 'User', required: true },
  parkingLotId: { type: Number, ref: 'ParkingSpot', required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['Evasa', 'In elaborazione', 'In sospeso'],
    required: true,
  },
  imageUrl: { type: String },
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);