const models = require("../models");

const arrayTransformer = require("./array");
const userTransformer = require("./user");
const providerTransformer = require("./provider");

const getTransformerForModel = model => {
  const model_name = model._modelOptions.name.singular;

  switch (model_name) {
    case "user":
      return userTransformer;
    case "provider":
      return providerTransformer;
    default:
      throw new Error("Cannot transform model " + model_name);
  }
};

const transformModelOrModelArray = transformable => {
  if (transformable instanceof Array) {
    return arrayTransformer.transform(transformable);
  }

  return getTransformerForModel(transformable).transform(transformable);
};

module.exports.for = getTransformerForModel;
module.exports.transform = transformModelOrModelArray;
