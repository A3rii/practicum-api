import mongoose from 'mongoose';
import moment from 'moment';

const bookingSchema = new mongoose.Schema(
  {
    // A must need schema
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User id reference must be provided'],
    },

    // In case of creating a booking by lessor themselves
    outside_user: {
      name: {
        type: String,
        required: false,
        default: '',
      },
      phone_number: {
        type: String,
        required: false,
        default: '',
      },
    },
    court: {
      type: String,
      required: true,
    },
    facility: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    lessor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lessor',
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return moment(value, 'hh:mm a', true).isValid();
        },
        message: 'Start time must be in HH:mm a format',
      },
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return (
            moment(value, 'hh:mm a', true).isValid() &&
            moment(value, 'hh:mm a').isAfter(moment(this.startTime, 'hh:mm a'))
          );
        },
        message: 'End time must be after start time and in HH:mm a format',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
  },
  { timestamps: true },
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
