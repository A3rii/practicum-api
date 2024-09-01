import mongoose from 'mongoose';
import facilitySchema from './facility.js';
import { colors } from '@mui/material';
const lessorSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name must be provided'],
  },
  last_name: {
    type: String,
    required: [true, 'Last name must be provided'],
  },
  email: {
    type: String,
    required: [true, 'Email must be provided'],
    unique: true,
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street must be provided'],
    },
    city: {
      type: String,
      required: [true, 'City must be provided'],
    },
    state: {
      type: String,
      required: [true, 'State must be provided'],
    },
  },
  password: {
    type: String,
    required: [true, 'Password must be provided'],
  },
  sportcenter_name: {
    type: String,
    required: [true, 'Sport center name must be provided'],
  },
  sportcenter_description: {
    type: String,
    default: '',
  },
  facilities: {
    type: [facilitySchema],
    required: false,
    default: [],
  },
  operating_hours: {
    open: {
      type: String,
      required: [true, 'Opening time must be provided'],
    },
    close: {
      type: String,
      required: [true, 'Closing time must be provided'],
    },
  },
  phone_number: {
    type: String,
    required: [true, 'Phone number must be provided'],
    unique: true,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      required: false,
      validate: {
        validator: function (coords) {
          return coords.length === 2; // Ensure it has two elements
        },
        message: 'Coordinates must have two elements [longitude, latitude].',
      },
    },
  },
  role: {
    type: String,
    default: 'admin',
  },
  logo: {
    type: String,
    default: '',
  },
  time_availability: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

lessorSchema.index({ location: '2dsphere' });

const Lessor = mongoose.model('Lessor', lessorSchema);
export default Lessor;
