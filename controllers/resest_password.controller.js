import bcrypt from 'bcryptjs';
import Lessor from './../models/lessor.js';
import SuperAdmin from '../models/superadmin.js';

const resetPassword = async (req, res) => {
  try {
    const { lessorId } = req.params; // Find lessor by ID
    const { password } = req.body; // Get new password from request
    const moderatorEmail = req.userData.email;

    // Check if the moderator exists
    const moderator = await SuperAdmin.findOne({ email: moderatorEmail });
    if (!moderator) {
      return res.status(404).json({ message: 'Moderator not found' });
    }

    // Check if a new password is provided
    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    // Hash the new password
    const newHashedPassword = await bcrypt.hash(password, 10);

    // Find lessor and update password
    const updatedLessor = await Lessor.findByIdAndUpdate(
      lessorId,
      { password: newHashedPassword },
      { new: true },
    );

    // If the lessor is not found
    if (!updatedLessor) {
      return res.status(404).json({ message: 'Lessor not found' });
    }

    // Return success message and updated lessor info
    return res.status(200).json({
      message: 'Password updated successfully',
      lessor: updatedLessor,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      message: 'An error occurred while updating the password',
    });
  }
};

export { resetPassword };
