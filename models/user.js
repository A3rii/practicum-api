import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name must be provided'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'email  must be provided'],
    unique: true,
  },
  password: {
    type: String,
    required: [
      function () {
        return !this.provider_id;
      },
    ],
    unique: true,
  },
  phone_number: {
    type: String,
    required: [
      function () {
        return !this.provider_id;
      },
      'Phone number must be provided for default users',
    ],
    unique: true,
  },
  provider_id: {
    type: String,
    required: false,
    default: '',
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
    required: false,
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

const User = mongoose.model('User', userSchema);

export default User;
