const models = require("../models");

module.exports.getById = async providerId => {
  return await models.providers.findOne({
    where: {
      id: providerId,
    },
  });
};

module.exports.create = async (userId, provider) => {
  return await models.providers.create({
    id: provider.id,
    user_id: userId,
    name: provider.name,
    accessToken: provider.accessToken,
    refreshToken: provider.refreshToken,
  });
};

module.exports.update = async provider => {
  const providerData = {
    accessToken: provider.accessToken,
    refreshToken: provider.refreshToken,
  };

  return await models.providers.update(providerData, {
    where: {
      id: provider.id,
    },
  });
};
