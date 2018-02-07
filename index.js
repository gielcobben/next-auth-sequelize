const next = require("next");
const nextAuth = require("next-auth");
const nextAuthConfig = require("./next-auth.config");
const express = require("express");

require("dotenv").load();

const expressApp = express();
const nextApp = next({
  dir: ".",
  dev: process.env.NODE_ENV === "development",
});

nextApp
  .prepare()
  .then(() => {
    return nextAuthConfig();
  })
  .then(nextAuthOptions => {
    // Handle all /_next/ requests before nextAuth and sessions.
    expressApp.all("/_next/*", (req, res) => {
      let nextRequestHandler = nextApp.getRequestHandler();
      return nextRequestHandler(req, res);
    });

    if (nextAuthOptions.port) delete nextAuthOptions.port;
    nextAuthOptions.expressApp = expressApp;
    nextAuth(nextApp, nextAuthOptions);

    expressApp.all("*", (req, res) => {
      let nextRequestHandler = nextApp.getRequestHandler();
      return nextRequestHandler(req, res);
    });

    expressApp.listen(process.env.PORT, err => {
      if (err) throw err;
      console.log("> Ready on http://localhost:" + process.env.PORT);
    });
  })
  .catch(err => {
    console.log("An error occurred, unable to start the server");
    console.log(err);
  });
