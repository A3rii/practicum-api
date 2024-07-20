import Lessor from './../models/lessor.js';
import asyncHandler from 'express-async-handler';

const showFacilities = asyncHandler(async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const lessor = await Lessor.findOne({ email: userEmail });

    const facility = lessor.facilities;
    if (!lessor) {
      return res.status(404).json({
        message: 'Lessor not found',
      });
    }
    return res.status(200).json({
      success: true,
      admin: {
        name: lessor.first_name + lessor.last_name,
        email: lessor.email,
      },
      facilities: facility,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

const showFacilitiesById = async (req, res) => {
  try {
    const userEmail = req.userData.email; // Assume userData is populated by some middleware
    const facilityId = req.params.id; // Extract facility ID from request parameters

    // Find the lessor by email
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({ message: 'Lessor not found' });
    }

    // Find the specific facility by its ID
    const facility = lessor.facilities.find(
      (facility) => facility._id.toString() === facilityId,
    );

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    res.status(200).json({
      success: true,
      facility,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createFacilities = async (req, res) => {
  try {
    const userEmail = req.userData.email;

    // Find the lessor by email
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({ message: 'Admin facility not found' });
    }

    // Extract the facility details from the request body
    const { name, description, price, court, image } = req.body;

    // Create a new facility object
    const newFacility = {
      name,
      description,
      price,
      court,
      image,
    };

    lessor.facilities.push(newFacility);

    // Save the updated lessor document
    await lessor.save();

    res.status(201).json({
      success: true,
      message: 'Facility created successfully',
      facility: newFacility,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const editFacility = async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const { id } = req.params;

    // Find the lessor by email
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({ message: 'Admin Facility not found' });
    }

    // Find the specific facility by its ID
    const facilityIndex = lessor.facilities.findIndex(
      (facility) => facility._id.toString() === id,
    );

    if (facilityIndex === -1) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Update the facility details
    const updatedFacility = {
      ...lessor.facilities[facilityIndex]._doc,
      ...req.body,
    };

    // Update the facility in the lessor's facilities array
    lessor.facilities[facilityIndex] = updatedFacility;

    // Save the updated lessor document
    await lessor.save();

    res.status(200).json({
      success: true,
      message: 'Facility updated successfully',
      facility: updatedFacility,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteFacility = async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const { id } = req.params; // Assume id is passed as a URL parameter

    // Find the lessor by email
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({ message: 'Admin Facility not found' });
    }

    // Find the specific facility by its ID
    const facilityIndex = lessor.facilities.findIndex(
      (facility) => facility._id.toString() === id,
    );

    if (facilityIndex === -1) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Remove the facility from the array
    lessor.facilities.splice(facilityIndex, 1);

    // Save the updated lessor document
    await lessor.save();

    res.status(200).json({ message: 'Facility deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  showFacilities,
  createFacilities,
  editFacility,
  deleteFacility,
  showFacilitiesById,
};
