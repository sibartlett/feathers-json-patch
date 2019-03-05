const { applyPatch } = require("fast-json-patch");

const wrap = service => {
  const newService = {};

  if (typeof service.setup === 'function') {
    newService.setup = (app, path) => service.setup(app, path);
  }

  if (typeof service.find === 'function') {
    newService.find = params => service.find(params);
  }

  if (typeof service.get === 'function') {
    newService.get = (id, params) => service.get(id, params);
  }

  if (typeof service.create === 'function') {
    newService.create = (data, params) => service.create(data, params);
  }

  if (typeof service.remove === 'function') {
    newService.remove = (id, params) => service.remove(id, params);
  }

  if (typeof service.update === 'function') {
    newService.update = (id, data, params) => service.update(id, data, params);
  }

  if (typeof service.patch === 'function') {
    newService.patch = (id, data, params) => {
      if (Array.isArray(data)) {
        return service
          .get(id, params)
          .then(document => applyPatch(document, data).newDocument)
          .then(document => service.patch(id, document, params));
      } else {
        return service.patch(id, data, params);
      }
    }
  }

  return newService;
};

module.exports = service => new Proxy(service, {
  construct(target, args) {
    return wrap(new target(...args));
  },
  apply(target, context, args) {
    return wrap(target.apply(context, args));
  }
});