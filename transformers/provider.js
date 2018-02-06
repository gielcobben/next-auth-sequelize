const userTransformer = require("./user");

module.exports.transform = provider => {
  return Object.assign(
    {},
    {
      id: provider.id,
      name: provider.name,
      accessToken: provider.accessToken ? provider.accessToken : null,
      refreshToken: provider.refreshToken,
    },
  );
};
