const providerTransformer = require("./provider");

module.exports.transform = user => {
  const object = Object.assign(
    {},
    {
      id: user.id,
      name: user.name,
      email: user.email,
      emailToken: user.emailToken,
      emailVerified: user.emailVerified,
    },
  );

  if (user.providers) {
    const providers = user.providers.map(provider => {
      const instance = providerTransformer.transform(provider);
      object[instance.name] = instance;
    });
  }

  return object;
};
