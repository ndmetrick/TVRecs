//this is the access point for all things database related!

const db = require('./db');

const User = require('./models/User');
const Follow = require('./models/Follow');
const Show = require('./models/Show');
const UserShow = require('./models/UserShow');

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

User.hasMany(UserShow);
Show.hasMany(UserShow);

UserShow.belongsTo(User);
UserShow.belongsTo(Show);

User.belongsToMany(Show, { through: UserShow });
Show.belongsToMany(User, { through: UserShow });

module.exports = {
  db,
  models: {
    User,
    Follow,
    Show,
  },
};
