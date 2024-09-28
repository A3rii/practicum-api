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
    required: [true, 'password must be provided'],
    unique: true,
  },
  phone_number: {
    type: String,
    required: [true, 'Phone number must be provided'],
    unique: true,
  },
  googleId: {
    type: String,
    require: false,
    unique: true,
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

const User = mongoose.model('User', userSchema);

export default User;
