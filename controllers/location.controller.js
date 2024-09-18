import Lessor from './../models/lessor.js';

const setLocationLessor = async (req, res) => {
  try {
    const { latitude, longitude } = req.body; // New coordinates from the request
    const userEmail = req.userData.email; // Email from user data

    // Find the lessor by email
    const lessor = await Lessor.findOne({ email: userEmail });
    if (!lessor) {
      return res.status(404).json({
        message: 'Lessor not found',
      });
    }

    lessor.location = lessor.location || { type: 'Point', coordinates: [] };
    lessor.location.coordinates = [parseFloat(longitude), parseFloat(latitude)]; // Correct coordinate order and ensure they are numbers

    // Save the updated lessor document
    await lessor.save();

    // Send a success response
    res.status(200).json({
      message: 'Update successfully',
      lessor,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const allSportCenterLocations = async (req, res) => {
  try {
    const sportCenterLocations = await Lessor.aggregate([
      {
        $match: {
          status: 'approved', // Ensure we only fetch approved lessors
        },
      },
      {
        $project: {
          sportcenter_name: 1,
          location: 1,
        },
      },
    ]);

    res.status(200).json({
      message: 'success',
      coordinates: sportCenterLocations,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const findNearestLocation = async (req, res) => {
  try {
    // Ensure latitude and longitude are numbers
    const latitude = parseFloat(req.query.latitude);
    const longitude = parseFloat(req.query.longitude);

    // Validate latitude and longitude
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }

    const coordinates = [longitude, latitude];

    // Perform the query using $near
    const findLocation = await Lessor.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates,
          },
        },
      },
    })
      .select('sportcenter_name address location')
      .limit(1); // Find the nearest point next to user

    if (!findLocation)
      return res.status(400).json({
        message: 'Location can not be found ',
      });

    res.status(200).json({
      message: 'Success',
      near: findLocation,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export { setLocationLessor, allSportCenterLocations, findNearestLocation };
