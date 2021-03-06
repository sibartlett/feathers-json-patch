const { applyPatch } = require("fast-json-patch");

const getSubDocument = (document, patch) => {
  const keys = patch.map(x => x.path.split("/")[1]);
  return keys.reduce((doc, key) => {
    doc[key] = document[key];
    return doc;
  }, {});
};

const wrap = service => {
  if (
    typeof service.get !== "function" ||
    typeof service.patch !== "function"
  ) {
    throw new Error(
      "feathers-json-patch expects services to implement get and patch methods"
    );
  }

  const newService = {
    get: (id, params) => service.get(id, params),
    patch: (id, data, params) => {
      if (id && Array.isArray(data)) {
        return service
          .get(id, params)
          .then(document => getSubDocument(document, data))
          .then(document => applyPatch(document, data).newDocument)
          .then(document => service.patch(id, document, params));
      } else {
        return service.patch(id, data, params);
      }
    }
  };

  if (typeof service.find === "function") {
    newService.find = params => service.find(params);
  }

  if (typeof service.create === "function") {
    newService.create = (data, params) => service.create(data, params);
  }

  if (typeof service.update === "function") {
    newService.update = (id, data, params) => service.update(id, data, params);
  }

  if (typeof service.remove === "function") {
    newService.remove = (id, params) => service.remove(id, params);
  }

  if (typeof service.setup === "function") {
    newService.setup = (app, path) => service.setup(app, path);
  }

  return newService;
};

module.exports = service =>
  new Proxy(service, {
    construct(target, args) {
      return wrap(new target(...args));
    },
    apply(target, context, args) {
      return wrap(target.apply(context, args));
    }
  });
