import mongoose from 'mongoose';
import facilitySchema from './facility.js';
const timeFormat = /^([1-9]|1[0-2])(am|pm)$/i;

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
      required: [true, 'State must be provided'], // Fixed 'require' to 'required'
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
      validate: {
        validator: function (v) {
          return timeFormat.test(v);
        },
        message: (props) => `${props.value} is not a valid opening time!`,
      },
    },
    close: {
      type: String,
      required: [true, 'Closing time must be provided'],
      validate: {
        validator: function (v) {
          return timeFormat.test(v);
        },
        message: (props) => `${props.value} is not a valid closing time!`,
      },
    },
  },
  phone_number: {
    type: String,
    required: [true, 'Phone number must be provided'],
    unique: true,
  },
  role: {
    type: String,
    default: 'admin',
  },
  logo: {
    type: String,
    default: '',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Lessor = mongoose.model('Lessor', lessorSchema);
export default Lessor;
