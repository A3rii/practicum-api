import SuperAdmin from './../models/superadmin.js';
import Lessor from '../models/lessor.js';

// Get Lessor for Super Admin
const moderatorLessors = async (req, res) => {
  try {
    const { lessorId } = req.query;
    const moderatorEmail = req.userData.email;
    const moderator = await SuperAdmin.findOne({ email: moderatorEmail });
    if (!moderator) {
      return res.status(404).json({ message: 'moderator not found' });
    }

    let lessors;

    if (lessorId) {
      lessors = await Lessor.findById({ _id: lessorId });
    }

    lessors = await Lessor.find({});

    res
      .status(200)
      .json({ message: 'Lessor found', moderator: moderator.name, lessors });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// update status for lessor registration
const updateLessorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { lessorId } = req.params;

    const moderatorEmail = req.userData.email;
    const moderator = await SuperAdmin.findOne({ email: moderatorEmail });
    if (!moderator) {
      return res.status(404).json({ message: 'moderator not found' });
    }

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const lessor = await Lessor.findById(lessorId);
    if (!lessor) return res.status(404).json({ message: 'lessor not found' });

    lessor.status = status;
    await lessor.save();

    res.status(200).json({ message: 'Lessor status updated', lessor });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export { moderatorLessors, updateLessorStatus };
