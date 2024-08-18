import Comment from './../models/comment.js';
import User from './../models/user.js';

/**
 *
 * @param {a} 1 star
 * @param {b} 2 stars
 * @param {c} 3 stars
 * @param {d} 4 stars
 * @param {e} 5 stars
 * @param {R} amount of all ratings
 * @formula  AR =  (a * 1  +  b * 2 + c * 3 + d * 4 + e * 5 )   /  (R)
 */

const averageRating = async (req, res) => {
  try {
    const { sportCenterId } = req.params;

    let totalRating = 0;
    let weightedSum = 0;

    // Count from 1 to 5 ratings only for approved reviews
    for (let i = 1; i <= 5; i++) {
      const starCount = await Comment.countDocuments({
        postTo: sportCenterId,
        status: 'approved',
        ratingValue: i,
      });

      totalRating += starCount;
      weightedSum += starCount * i;
    }

    // Calculate average rating
    const averageStars = totalRating ? weightedSum / totalRating : 0;

    res.status(200).json({
      message: 'Rating found',
      lessor: sportCenterId,
      userRates: totalRating,
      averageStars: Math.round(averageStars * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const ratingOverview = async (req, res) => {
  try {
    const { sportCenterId } = req.params;
    const ratingCounts = {};

    for (let i = 1; i <= 5; i++) {
      ratingCounts[`countRating_${i}`] = await Comment.countDocuments({
        postTo: sportCenterId,
        status: 'approved',
        ratingValue: i,
      });
    }
    const totalRating = await Comment.countDocuments({
      postTo: sportCenterId,
      status: 'approved',
    });

    res.status(200).json({
      message: 'Success',
      lessor: sportCenterId,
      totalRating,
      count: { ...ratingCounts },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export { averageRating, ratingOverview };
