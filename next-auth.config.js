require("dotenv").load();

const nextAuthProviders = require("./next-auth.providers");
const nextAuthFunctions = require("./next-auth.functions");

const models = require("./models");

const expressSession = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(
  expressSession.Store,
);

const sessionStore = new SequelizeStore({
  db: models.sequelize,
});

module.exports = () => {
  return nextAuthFunctions().then(functions => {
    return new Promise((resolve, reject) => {
      resolve({
        port: process.env.PORT || 3000,
        sessionSecret: "change-me",
        sessionMaxAge: 60000 * 60 * 24 * 7,
        sessionRevalidateAge: 60000,
        serverUrl: process.env.SERVER_URL || null,
        expressSession: expressSession,
        sessionStore: sessionStore,
        providers: nextAuthProviders(),
        functions: functions,
      });
    });
  });
};
