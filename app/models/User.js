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

// Add static method to find users by role
UserSchema.statics.findByRole = async function (role) {
  try {
    return await this.find({ role });
  } catch (error) {
    console.error('Error finding users by role:', error);
    throw error;
  }
};

// Add static method to find a user by username
UserSchema.statics.findByUsername = async function (username) {
  try {
    return await this.findOne({ username });
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw error;
  }
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
