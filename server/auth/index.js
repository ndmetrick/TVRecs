const router = require('express').Router();
const {
  models: { User, Follow },
} = require('../db/models');
module.exports = router;
const ManagementClient = require('auth0').ManagementClient;

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
    console.log('i got here to login');

    const auth0 = new ManagementClient({
      domain, // figure out where to store
      clientId, // figure out where to store
      clientSecret, // figure out where to store
    });
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
    } else {
      //***** */

      console.log('CANNOT FIND A USER so I am making a new one');
      const user = await User.create({
        username: data.name,
        auth0Id: data.sub,
      });
      res.send(user);
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
