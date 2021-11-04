const express = require('express');
const app = express();
// const { auth } = require('express-oauth2-jwt-bearer');

// var jwt = require('express-jwt');
// var jwks = require('jwks-rsa');

// var port = process.env.PORT || 8080;

// var jwtCheck = jwt({
//   secret: jwks.expressJwtSecret({
//     cache: true,
//     rateLimit: true,
//     jwksRequestsPerMinute: 5,
//     jwksUri: 'https://dev--5p-bz53.us.auth0.com/.well-known/jwks.json',
//   }),
//   audience: 'https://tvrecs/api',
//   issuer: 'https://dev--5p-bz53.us.auth0.com/',
//   algorithms: ['RS256'],
// });

// app.use(jwtCheck);

// app.get('/authorized', function (req, res) {
//   res.send('Secured Resource');
// });

// app.listen(port);

module.exports = app;

app.use(morgan('dev'));

app.use(express.json());

app.use('/auth', require('./auth'));
app.use('/api', require('./api'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public/index.html'))
);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res, next) => {
  if (path.extname(req.path).length) {
    const err = new Error('Not found');
    err.status = 404;
    next(err);
  } else {
    next();
  }
});

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status ?? 500).send(err.message ?? 'Internal server error.');
});
