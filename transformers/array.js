const transformer = require("./index");

module.exports.transform = models => {
  return models.map(model => {
    return transformer.for(model).transform(model);
  });
};
