import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User id reference must be provided'],
    },
    lessor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lessor',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking id reference must be provided'],
    },

    currency: {
      type: String,
      enum: ['usd', 'khr'],
      default: 'khr',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Price must be provided'],
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'paid',
      required: true,
    },
  },
  { timestamps: true },
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
