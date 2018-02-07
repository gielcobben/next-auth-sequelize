import fetch from "isomorphic-fetch";

export const api = (url, options = {}, Cookie = null) => {
  if (Cookie) {
    if (!options.headers || !options.headers.Cookie) {
      options.headers = Object.assign({}, options.headers, { Cookie });
    }
  }

  if (!options.credentials) {
    options.credentials = "include";
  }

  const apiDomain = process.env.SERVER_URL || "";
  return fetch(apiDomain + url, options);
};

export default api;