import Booking from '../models/booking.js';
import Lessor from '../models/lessor.js';
import moment from 'moment';
import dayjs from 'dayjs';
import { isSameDay, startOfDay } from 'date-fns';
import { sendBookingNotification } from './../listeners/socketManager.js';

//* Get all the bookings from the users
const getBookingForLessor = async (req, res) => {
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

    // Get all the bookings information that matches
    const bookings = await Booking.find({ lessor: lessor._id })
      .sort({ date: -1 })
      .populate('lessor', 'first_name last_name')
      .populate('user', 'name email phone_number')
      .skip(skip)
      .limit(limit);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let updatedBookings = [];

    for (let booking of bookings) {
      if (booking.date < currentDate && booking.status === 'pending') {
        // Update booking status to 'rejected' if the date is expired
        booking.status = 'rejected';
        await booking.save();
      }
      updatedBookings.push(booking);
    }

    res.status(200).json({ message: 'Success', bookings: updatedBookings });
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

    // If the bookings are not found return 404
    if (!bookings || bookings.length === 0) {
      return res
        .status(200)
        .json({ message: 'There are no bookings', bookings });
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

    // Populate the user field with the user's name and other details
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate('user', 'name')
      .exec();

    // Send the notification with the populated booking
    sendBookingNotification(populatedBooking);

    res
      .status(201)
      .json({ message: 'Booking saved successfully', booking: savedBooking });
  } catch (err) {
    console.error('Error creating booking');
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
      return res.status(200).json({ message: 'There is not booking' });
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

const bookingAvailable = async (req, res) => {
  const { date, facility, court } = req.query;
  const { lessorID } = req.params;

  try {
    // Validate date query parameter
    if (!date) {
      return res
        .status(400)
        .json({ message: 'Date query parameter is required' });
    }

    const lessor = await Lessor.findOne({ _id: lessorID });

    // Check if lessor exists
    if (!lessor) {
      return res.status(404).json({ message: 'Lessor not found' });
    }

    const parsedDate = startOfDay(new Date(date));

    const query = {
      lessor: lessor._id,
      facility: facility,
    };

    // Include court in the query only if it's provided
    if (court) {
      query.court = court;
    }
    // Fetch bookings for the lessor and specified facility
    const bookings = await Booking.find(query)
      .populate('lessor', 'first_name last_name') // Populate lessor details
      .populate('user', 'name email phone_number'); // Populate user details

    // Filter bookings by date
    const filteredBookings = bookings.filter((booking) => {
      const bookingDate = startOfDay(new Date(booking.date));
      return isSameDay(bookingDate, parsedDate);
    });

    /** Covert date for sorting
     *
     * @param {*} date
     * @param {*} time
     * @returns  ISODate  (2024-07-19T17:00:00.000Z)
     */
    const convertTime = (date, time) => {
      return dayjs(
        `${dayjs(date).format('YYYY-MM-DD')} ${time}`,
        'YYYY-MM-DD hh:mm A',
      ).format('HH:mm a');
    };

    // Extract required fields and convert times
    const requiredBookings = filteredBookings.map((booking) => ({
      user: booking?.user?.name || booking?.outside_user?.name,
      facility: booking.facility,
      court: booking.court,
      start: convertTime(parsedDate, booking.startTime),
      end: convertTime(parsedDate, booking.endTime),
      status: booking.status,
    }));

    // Sort bookings by start time
    const sortedBookings = requiredBookings.sort((a, b) => {
      const timeA = a.start.split(':').map(Number);
      const timeB = b.start.split(':').map(Number);

      return timeA[0] - timeB[0] || timeA[1] - timeB[1];
    });

    // Respond with the sorted bookings
    res.status(200).json({
      message:
        requiredBookings.length > 0 ? 'Bookings found' : 'No bookings found',
      date: dayjs(parsedDate).format('YYYY-MM-DD'),
      bookings: sortedBookings,
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};

export {
  getBookingForLessor,
  createBooking,
  updateBookingStatus,
  queryBookings,
  bookingsPagination,
  bookingAvailable,
};
