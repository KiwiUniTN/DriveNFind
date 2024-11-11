import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['baseuser', 'admin'],
    required: true,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
