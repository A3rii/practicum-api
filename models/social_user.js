import mongoose from 'mongoose';

const socialUserSchema = new mongoose.Schema({
  provider_id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'name must be provided'],
    unique: true,
  },
  avatar: {
    type: String,
    required: false,
    default: '',
  },
  provider: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SocialUser = mongoose.model('SocialUser', socialUserSchema);

export default SocialUser;
