import mongoose from 'mongoose';
import courtSchema from './court.js';

const timeFormat = /^([1-9]|1[0-2])(am|pm)$/i;

//* Facilities  Like Football or Basketball
const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Facility name must be provided'],
  },
  description: {
    type: String,
    required: [true, 'Description must be provided'],
  },
  price: {
    type: Number,
    required: [true, 'Price must be provided'],
  },
  court: { type: [courtSchema], default: [], required: false },
  image: {
    type: String,
    default: '',
  },
});

export default facilitySchema;
