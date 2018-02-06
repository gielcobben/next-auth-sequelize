require("dotenv").load();
const NeDB = require("nedb");
const nodemailer = require("nodemailer");
const nodemailerSmtpTransport = require("nodemailer-smtp-transport");
const nodemailerDirectTransport = require("nodemailer-direct-transport");

const models = require("./models");
const transformer = require("./transformers");
const userService = require("./services/user");
const providerService = require("./services/provider");

// Send email direct from localhost if no mail server configured
let nodemailerTransport = nodemailerDirectTransport();
if (
  process.env.EMAIL_SERVER &&
  process.env.EMAIL_USERNAME &&
  process.env.EMAIL_PASSWORD
) {
  nodemailerTransport = nodemailerSmtpTransport({
    host: process.env.EMAIL_SERVER,
    port: process.env.EMAIL_PORT || 25,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

module.exports = () => {
  return Promise.resolve({
    find: async ({ id, email, emailToken, provider } = {}) => {
      console.log("FIND");

      let user;

      if (id) {
        console.log("FIND BY ID");
        user = await userService.getById(id);
      } else if (email) {
        console.log("FIND BY EMAIL");
        user = await userService.getByEmail(email);
      } else if (emailToken) {
        console.log("FIND BY EMAILTOKEN");
        user = await userService.getByEmailToken(emailToken);
      } else if (provider) {
        console.log("FIND BY PROVIDER");
        user = await userService.getByProvider(provider);
      }

      if (!user) {
        return null;
      } else {
        return transformer.transform(user);
      }
    },
    insert: async (user, profile) => {
      console.log("INSERT");

      let username;
      const providers = [];
      const twitter = user.twitter || false;
      const facebook = user.facebook || false;

      if (twitter) {
        twitter["name"] = "twitter";
        providers.push(twitter);
      }

      if (facebook) {
        facebook["name"] = "facebook";
        providers.push(facebook);
      }

      // Add oAuth stuff to user
      const userObject = Object.assign({}, user, {});

      if (providers.length > -1) {
        const newUser = await userService.create(userObject);
        const transformedUser = transformer.transform(newUser);

        const addProviders = await Promise.all(
          providers.map(async provider => {
            const newProvider = await providerService.create(
              transformedUser.id,
              provider,
            );
            return newProvider;
          }),
        );

        const combinedUser = await userService.getById(transformedUser.id);
        return transformer.transform(combinedUser);
      } else {
        const newUser = await userService.create(user);
        return await transformer.transform(newUser);
      }
    },
    update: async (user, profile) => {
      console.log("UPDATE");

      const providers = [];
      const twitter = user.twitter || false;
      const facebook = user.facebook || false;

      if (twitter) {
        twitter["name"] = "twitter";
        providers.push(twitter);
      }

      if (facebook) {
        facebook["name"] = "facebook";
        providers.push(facebook);
      }

      if (providers.length > -1) {
        const updateProviders = await Promise.all(
          providers.map(async provider => {
            let updatedProvider;
            const dbProvider = await providerService.getById(provider.id);

            if (dbProvider) {
              updatedProvider = await providerService.update(provider);
            } else {
              updatedProvider = await providerService.create(user.id, provider);
            }

            return updatedProvider;
          }),
        );
      }

      const newUser = await userService.getById(user.id);
      return transformer.transform(newUser);
    },
    remove: async id => {},
    serialize: async user => {
      console.log("SERIALIZE");

      if (user.id) {
        return Promise.resolve(user.id);
      } else {
        return Promise.reject(new Error("Unable to serialise user"));
      }
    },
    deserialize: async id => {
      console.log("DE-SERIALIZE");

      const user = await userService.getById(id);
      if (!user) {
        return null;
      } else {
        const userTransformed = await transformer.transform(user);

        return {
          id: userTransformed.id,
          name: userTransformed.name,
          email: userTransformed.email,
          emailVerified: userTransformed.emailVerified || false,
        };
      }
    },
    sendSignInEmail: async ({ email = null, url = null } = {}) => {
      console.log("EMAIL");

      nodemailer.createTransport(nodemailerTransport).sendMail(
        {
          to: email,
          from: process.env.EMAIL_FROM,
          subject: "Sign in link",
          text: `Use the link below to sign in:\n\n${url}\n\n`,
          html: `<p>Use the link below to sign in:</p><p>${url}</p>`,
        },
        err => {
          if (err) {
            console.error("Error sending email to " + email, err);
          }
        },
      );
      if (process.env.NODE_ENV === "development") {
        console.log("Generated sign in link " + url + " for " + email);
      }
    },
  });
};
