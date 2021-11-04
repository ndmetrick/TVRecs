const {
  models: { User },
} = require('../db');

const requireToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const user = await User.findByToken(token);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const isLoggedIn = (req, res, next) => {
  if (!req.user.id) {
    next({
      status: 403,
      message: 'You must be a logged-in user to access this page!',
    });
  } else {
    next();
  }
};

module.exports = {
  requireToken,
  isLoggedIn,
};
