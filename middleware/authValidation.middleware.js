import Validator from 'validatorjs';

//* Sign Up Validation
const registerValidation = (req, res, next) => {
  const validateRule = {
    name: 'required|string|min:3',
    email: 'required|email',
    password: 'required|min:6',
    phone_number: 'required|min:8',
  };

  const validation = new Validator(req.body, validateRule);

  if (validation.fails()) {
    return res.status(412).send({
      success: false,
      message: 'Validation failed',
      data: validation.errors.all(),
    });
  }

  next();
};

//* Login Validation
const loginValidation = (req, res, next) => {
  const validateRule = {
    emailOrPhone: 'required',
    password: 'required|min:6',
  };

  const validation = new Validator(req.body, validateRule);

  if (validation.fails()) {
    return res.status(412).json({
      success: false,
      message: 'Validation failed',
      data: validation.errors.all(),
    });
  }

  next();
};
export { registerValidation, loginValidation };
