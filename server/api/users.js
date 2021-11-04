const router = require('express').Router();
const {
  models: { User, Follow, Show },
} = require('../db/models');
module.exports = router;


// figure out gatekeeping middleware / how to protect back end
const { requireToken, isLoggedIn } = require('./gatekeepingMiddleware');
module.exports = router;

router.get('/', async (req, res, next) => {
  res.json('hello')
})

router.get('/currentUser', requireToken, isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findAll({
      where:
      include: [Follow, Show],
    });
    console.log('current user', user);
    res.json(user);
  } catch (err) {
    next(err);
  }
});
