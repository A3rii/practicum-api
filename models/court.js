import mongoose from 'mongoose';
//* Court Like Court A or B
const courtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  image: {
    type: [String],
    default: [],
  },
});

export default courtSchema;
