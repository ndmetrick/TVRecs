/* TO do:
-- 1. add back end (start with expo and move over)
-- 3. research how to move from expo to someone able to test app
-- 2. map out tables and make attempt at recreating what you have in sequelize and express
-- 4. start adding tags

*/

const Sequelize = require('sequelize');

const User = sequelize.define('User', {});
const Follow = sequelize.define('Following', {});

User.belongsToMany(User, {
  through: Follow,
  as: 'Followers',
  foreignKey: 'follower',
});
User.belongsToMany(User, {
  through: Follow,
  as: 'Following',
  foreignKey: 'following',
});

User.hasMany(Follow, {
  as: 'FollowerLinks',
  foreignKey: 'follower',
});
User.hasMany(Follow, {
  as: 'FollowingLinks',
  foreignKey: 'following',
});

Follow.belongsTo(User, {
  as: 'Following,',
  foreignKey: 'following',
});

Follow.belongsTo(User, {
  as: 'Followers,',
  foreignKey: 'follower',
});
