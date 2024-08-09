import mongoose from 'mongoose';

const superAdminSchema = new mongoose.Schema({
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
  avatar: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: 'moderator',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);
export default SuperAdmin;
