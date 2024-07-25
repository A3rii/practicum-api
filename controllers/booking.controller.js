import Booking from '../models/booking.js';
import Lessor from '../models/lessor.js';
import moment from 'moment';

//* Get all the bookings from the users
const getBookingForLessor = async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({ message: 'Lessor not found' });
    }

    // Get all the bookings information that is match
    const bookings = await Booking.find({ lessor: lessor._id })
      .sort({ date: -1 })
      .populate('lessor', 'first_name last_name')
      .populate('user', 'name email phone_number');

    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: 'Bookings not found for this lessor' });
    }

    res.status(200).json({ message: 'Success', bookings: bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const bookingsPagination = async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({ message: 'Lessor not found' });
    }

    // Extract page and limit from query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Get the current date and set the time to the start of the day
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // In new date it captures the date and time so set default time to 0 which we can compare

    // Find bookings for the lessor with dates in the future or present
    const bookings = await Booking.find({
      lessor: lessor._id,
      date: { $gte: currentDate },
    })
      .populate('lessor', 'first_name last_name') // Ref by lessor
      .populate('user', 'name email phone_number') // Ref by user
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    console.log(bookings);

    // If the bookings are not found return 404
    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: 'Bookings not found for this lessor' });
    }

    // Get total count of bookings for pagination
    const totalBookings = await Booking.countDocuments({
      lessor: lessor._id,
      date: { $gte: currentDate },
    });

    res.status(200).json({
      message: 'Success',
      currentPage: page,
      totalPages: Math.ceil(totalBookings / limit),
      totalBookings: totalBookings,
      bookings: bookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//* Bookings sport center
const createBooking = async (req, res) => {
  const {
    user,
    outside_user,
    lessor,
    facility,
    court,
    date,
    startTime,
    endTime,
  } = req.body;

  if (!user || !lessor || !facility || !court || !startTime || !endTime) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate time format using moment
  if (
    !moment(startTime, 'hh:mm a', true).isValid() ||
    !moment(endTime, 'hh:mm a', true).isValid()
  ) {
    return res
      .status(400)
      .json({ message: 'Start time and end time must be in hh:mm a format' });
  }

  // Validate end time is after start time
  if (moment(endTime, 'hh:mm a').isBefore(moment(startTime, 'hh:mm a'))) {
    return res
      .status(400)
      .json({ message: 'End time must be after start time' });
  }
  try {
    const newBooking = new Booking({
      user,
      outside_user,
      lessor,
      facility,
      court,
      date,
      startTime,
      endTime,
    });

    const savedBooking = await newBooking.save();
    res
      .status(201)
      .json({ message: 'Booking saved successfully', booking: savedBooking });
  } catch (err) {
    console.error('Error creating booking:');
    res.status(500).json({ message: err.message });
  }
};

//* Changing Status [pending , approved , rejected]
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: 'Booking status updated', booking });
  } catch (err) {
    console.error('Error updating booking status:', err.message);
    res.status(500).json({ message: err.message });
  }
};

//* Filter Status from bookings
const queryBookings = async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({ message: 'Lessor not found' });
    }

    const { status } = req.query;
    const query = { lessor: lessor._id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query);

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        message: `No bookings found for status ${status} `,
        bookings: [],
      });
    }

    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  getBookingForLessor,
  createBooking,
  updateBookingStatus,
  queryBookings,
  bookingsPagination,
};
