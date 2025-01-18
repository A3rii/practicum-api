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

    const payments = await Payment.find({ lessor: lessor._id })
      .populate('lessor', 'first_name last_name')
      .populate('user', 'name email phone_number')
      .populate('booking', 'facility court date startTime endTime')
      .sort({ createdAt: -1 });

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

const totalIcomeForLessor = async (req, res) => {
  try {
    const userEmail = req.userData.email;

    // Find lessor and handle potential errors
    const lessor = await Lessor.findOne({ email: userEmail });
    if (!lessor) {
      return res.status(404).json({
        success: false,
        message: 'Lessor not found',
      });
    }

    const totalIncome = await Payment.aggregate([
      {
        // Match payments for this lessor
        $match: {
          lessor: lessor._id,
          // Only include completed payments
          status: 'paid',
        },
      },
      {
        $facet: {
          khrIncome: [
            {
              $match: {
                currency: 'khr',
                amount: { $exists: true, $ne: null },
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: {
                  $sum: {
                    $divide: [
                      { $ifNull: ['$amount', 0] },
                      4000, // KHR to USD conversion rate
                    ],
                  },
                },
                count: { $sum: 1 },
              },
            },
          ],
          usdIncome: [
            {
              $match: {
                currency: 'usd',
                amount: { $exists: true, $ne: null },
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: {
                  $sum: { $ifNull: ['$amount', 0] },
                },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
      {
        $project: {
          totalAmountUSD: {
            $add: [
              { $ifNull: [{ $arrayElemAt: ['$khrIncome.totalAmount', 0] }, 0] },
              { $ifNull: [{ $arrayElemAt: ['$usdIncome.totalAmount', 0] }, 0] },
            ],
          },
          totalTransactions: {
            $add: [
              { $ifNull: [{ $arrayElemAt: ['$khrIncome.count', 0] }, 0] },
              { $ifNull: [{ $arrayElemAt: ['$usdIncome.count', 0] }, 0] },
            ],
          },
          khrDetails: {
            amount: {
              $ifNull: [{ $arrayElemAt: ['$khrIncome.totalAmount', 0] }, 0],
            },
            transactions: {
              $ifNull: [{ $arrayElemAt: ['$khrIncome.count', 0] }, 0],
            },
          },
          usdDetails: {
            amount: {
              $ifNull: [{ $arrayElemAt: ['$usdIncome.totalAmount', 0] }, 0],
            },
            transactions: {
              $ifNull: [{ $arrayElemAt: ['$usdIncome.count', 0] }, 0],
            },
          },
        },
      },
    ]);

    // Format the response
    const result = totalIncome[0] || {
      totalAmountUSD: 0,
      totalTransactions: 0,
      khrDetails: { amount: 0, transactions: 0 },
      usdDetails: { amount: 0, transactions: 0 },
    };

    return res.status(200).json({
      success: true,
      message: 'Total income retrieved successfully',
      data: {
        totalAmountUSD: Number(result.totalAmountUSD.toFixed(2)),
        totalTransactions: result.totalTransactions,
        breakdown: {
          khr: {
            amountUSD: Number(result.khrDetails.amount.toFixed(2)),
            transactions: result.khrDetails.transactions,
          },
          usd: {
            amount: Number(result.usdDetails.amount.toFixed(2)),
            transactions: result.usdDetails.transactions,
          },
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate total income',
    });
  }
};

export { userPayments, getUserPayments, totalIcomeForLessor };
