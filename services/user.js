const models = require("../models");

module.exports.getAll = (limit = 50, offset = 0) => {
  return models.users.findAll({
    limit: limit,
    offset: offset,
  });
};

module.exports.getById = async userId => {
  return await models.users.findOne({
    include: [models.providers],
    where: {
      id: userId,
    },
  });
};

module.exports.getByUsername = username => {
  return models.users.findOne({
    where: {
      username: username,
    },
  });
};

module.exports.getByEmail = userEmail => {
  return models.users.findOne({
    include: [models.providers],
    where: {
      email: userEmail,
    },
  });
};

module.exports.getByEmailToken = userEmailToken => {
  return models.users.findOne({
    include: [models.providers],
    where: {
      emailToken: userEmailToken,
    },
  });
};

module.exports.getByProvider = async ({ name, id }) => {
  const provider = await models.providers.findOne({
    include: [
      {
        model: models.users,
        include: [models.providers],
      },
    ],
    where: {
      id: id,
    },
  });

  if (provider && provider.user) {
    return provider.user;
  } else {
    return null;
  }
};

module.exports.create = async user => {
  return await models.users.create({
    name: user.name,
    username: user.username,
    email: user.email,
    emailToken: user.emailToken ? user.emailToken : null,
  });
};

module.exports.update = async user => {
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified ? user.emailVerified : false,
  };

  if (user.emailToken) {
    userData["emailToken"] = user.emailToken;
  }

  return await models.users.update(userData, {
    where: {
      id: userData.id,
    },
  });
};
