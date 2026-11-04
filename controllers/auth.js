const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const { BadRequestError, UnauthenticatedError } = require("../errors");

const User = require("../models/User");

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({ user, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (user) {
    const isPasswordMatch = user.comparePasswords(password);
    if (!isPasswordMatch) {
      throw new UnauthenticatedError("Please provide valid email and password");
    }
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
  } else {
    throw new UnauthenticatedError("Please provide valid email and password");
  }
};

module.exports = {
  register,
  login,
};
