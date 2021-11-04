const router = require('express').Router();
const {
  models: { User, Follow },
} = require('../db/models');
module.exports = router;
const ManagementClient = require('auth0').ManagementClient;

const auth0 = new ManagementClient({
  domain: 'dev--5p-bz53.us.auth0.com',
  clientId: 'rMIdw36DYTg1ZmOuux0xDfUvj0rbO6u3',
  clientSecret:
    'l4MtU3fRBARKE9pLUx4sYhhQkklip3fYk1Zg2ou7a0H3Q2zWz3iu2Ud-v0r0Z-zx',
});

router.post('/signup', async (req, res, next) => {
  try {
    const { data } = await auth0.getUsers({ id: req.user.sub });
    if (data.blocked === true) {
      throw new Error('Blocked');
    }
    // if (data.email_verified === false) {
    //   throw new Error('Email not verified');
    // }
    const user = await User.create({ username: data.name, auth0Id: data.sub });
    res.send(user);
  } catch (err) {
    next(err);
  }
});

router.get('/login', async (req, res, next) => {
  try {
    const { data } = await auth0.getUsers({ id: req.user.sub });
    if (data.blocked === true) {
      throw new Error('Blocked');
    }
    // if (data.email_verified === false) {
    //   throw new Error('Email not verified');
    // }
    const user = User.findAll({
      where: {
        auth0Id: data.sub,
      },
      include: {
        model: [User, Follow],
      },
    });
    if (user) {
      res.send(user);
    }
    //*** */
    else {
      console.log('CANNOT FIND A USER');
    }
  } catch (err) {
    next(err);
  }
});

// router.get('/me', async (req, res, next) => {
//   try {
//     res.send(await User.findByToken(req.headers.authorization));
//   } catch (ex) {
//     next(ex);
//   }
// });
