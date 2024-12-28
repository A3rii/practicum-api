import Payment from './../models/payment.js';
import Lessor from './../models/lessor.js';
//* POST
// User payment after paying the booking
const userPayments = async (req, res) => {
  try {
    const { user, lessor, currency, amount, booking } = req.body;

    if (!user || !lessor || !currency || !amount || !booking) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newPayment = new Payment({
      user,
      lessor,
      booking,
      currency,
      amount,
    });

    const savePayment = await newPayment.save();

    return res.status(201).json({
      message: 'success',
      payment: savePayment,
    });
  } catch (err) {
    console.error('Error creating payment');
    throw new Error(err);
  }
};

//*GET

const getUserPayments = async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({ message: 'Lessor not found' });
    }

    const payments = await Payment.find({})
      .populate('lessor', 'first_name last_name')
      .populate('user', 'name email phone_number')
      .populate('booking', 'facility court date startTime endTime');

    if (!payments || payments.length === 0) {
      return res
        .status(200)
        .json({ message: 'Payment not found for this lessor' });
    }

    res.status(200).json({ message: 'success', payments });
  } catch (err) {
    console.error('Error getting payment');
    throw new Error(err);
  }
};

export { userPayments, getUserPayments };
