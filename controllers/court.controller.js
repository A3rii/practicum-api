import Lessor from './../models/lessor.js';
import asyncHandler from 'express-async-handler';

const showCourt = asyncHandler(async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const lessor = await Lessor.findOne({ email: userEmail });
    if (!lessor) {
      return res.status(404).json({
        message: 'Lessor not found',
      });
    }

    // Assuming the facilities are embedded in the lessor document
    const facilities = lessor.facilities;

    if (!facilities || facilities.length === 0) {
      return res
        .status(404)
        .json({ message: 'No facilities found for this lessor' });
    }

    const court = facilities.flatMap((facility) => facility.court);

    if (!court || court.length === 0) {
      return res.status(404).json({ message: 'No courts found', courts: [] });
    }
    console.log(court);
    res.status(200).json({
      message: 'Success',
      admin: {
        name: `${lessor.first_name} ${lessor.last_name}`,
        email: lessor.email,
      },
      court,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

const showCourtById = asyncHandler(async (req, res) => {
  try {
    const { facilityId, courtId } = req.params; //Get ID from Facility then Court
    const userEmail = req.userData.email;
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({
        message: 'Lessor not found',
      });
    }

    // check if we have facility
    const facilityIndex = lessor.facilities.findIndex(
      (facility) => facility._id.toString() === facilityId,
    );

    if (facilityIndex === -1) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    const facility = lessor.facilities[facilityIndex];
    const courtIndex = facility.court.findIndex(
      (court) => court._id.toString() === courtId,
    );

    // If we have facility and the court is empty
    if (courtIndex === -1) {
      return res.status(404).json({ message: 'Court not found' });
    }

    const court = facility.court[courtIndex];
    res.status(200).json({ message: 'Court found', court: court });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createCourt = asyncHandler(async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const id = req.params.id;

    // Find the lessor by email
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({
        message: 'Lessor not found',
      });
    }

    // Access the facilities array from the lessor document
    const facilities = lessor.facilities;

    // Validate name and description are provided
    const { name, description, image } = req.body;

    console.log(name);
    console.log(description);
    if (!name || !description) {
      return res.status(400).json({
        message: 'name and description must be provided',
      });
    }

    const facilityIndex = facilities.findIndex(
      (facility) => facility._id.toString() === id,
    );

    if (facilityIndex === -1) {
      return res.status(404).json({
        message: 'Facility not found',
      });
    }

    // Create a new court object
    const newCourt = {
      name,
      description,
      image,
    };

    facilities[facilityIndex].court.push(newCourt);

    // Save the updated lessor document
    await lessor.save();

    res.status(201).json({
      success: true,
      message: 'Court created successfully',
      court: newCourt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 *  Find the facility then access to court
 */
const editCourt = asyncHandler(async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const { facilityId, courtId } = req.params; // Get ID from Facility then Court

    // Find the lessor by email
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({
        message: 'Lessor not found',
      });
    }

    // Find the specific facility by its ID
    const facilityIndex = lessor.facilities.findIndex(
      (facility) => facility._id.toString() === facilityId,
    );

    if (facilityIndex === -1) {
      return res.status(404).json({
        message: 'Facility not found',
      });
    }

    // Find the specific court by its ID within the facility
    const facility = lessor.facilities[facilityIndex];
    const courtIndex = facility.court.findIndex(
      (court) => court._id.toString() === courtId,
    );

    // If we have facility and the court is empty
    if (courtIndex === -1) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Update the court details
    const { name, description, image } = req.body;
    if (name) facility.court[courtIndex].name = name;
    if (description) facility.court[courtIndex].description = description;

    if (image) {
      if (Array.isArray(image)) {
        // If the image field is an array, replace the entire array
        facility.court[courtIndex].image = image;
      } else {
        // If the image field is a single image URL, append it to the current images
        facility.court[courtIndex].image.push(image);
      }
    }

    // Save the updated lessor document
    await lessor.save();

    res.status(200).json({
      success: true,
      message: 'Court updated successfully',
      court: facility.court[courtIndex],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteCourt = asyncHandler(async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const { facilityId, courtId } = req.params; // Get ID from Facility then Court

    // Find the lessor by email
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({
        message: 'Lessor not found',
      });
    }

    // Find the specific facility by its ID
    const facilityIndex = lessor.facilities.findIndex(
      (facility) => facility._id.toString() === facilityId,
    );

    if (facilityIndex === -1) {
      return res.status(404).json({
        message: 'Facility not found',
      });
    }

    // Find the specific court by its ID within the facility
    const facility = lessor.facilities[facilityIndex];
    const courtIndex = facility.court.findIndex(
      (court) => court._id.toString() === courtId,
    );

    // If we have facility and the court is empty
    if (courtIndex === -1) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Remove the court from the facility
    facility.court.splice(courtIndex, 1);

    // Save the updated lessor document
    await lessor.save();

    res.status(200).json({
      success: true,
      message: 'Court deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export { showCourt, createCourt, editCourt, showCourtById, deleteCourt };
