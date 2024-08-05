import jwt from 'jsonwebtoken';

const checkAdminRole = (req, res, next) => {
  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is missing or invalid',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userData = decoded;
    console.log(req.userData);
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sorry, you need admin access for this route',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Access token is invalid',
    });
  }
};

export default checkAdminRole;
