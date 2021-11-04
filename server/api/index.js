const router = require('express').Router();
module.exports = router;

router.use('/users', require('./users'));
router.use('/shows', require('./shows'));
console.log('i got here to api');

router.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});
