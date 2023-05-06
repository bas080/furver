FurverClient.fetch = function furverClientFetch(url, options) {
  return fetch(url, {
    method: 'post',
    ...options
  })
}

FurverClient.schema = async function furverClientSchema(url) {
  const schemaRes = await fetch(url);
  return await schemaRes.json();
};

const isFunction = x => typeof x === 'function'

const castFunction = x => isFunction(x) ? x : () => x

async function FurverClient({
  endpoint = 'http://localhost:3000',
  fetch = FurverClient.fetch,
  schema = FurverClient.schema
}) {
  const api = {};
  let promise;
  let reqs = [];

  const bulkFetch = (expr) => {
    const index = reqs.length;
    reqs.push(expr);

    promise = promise || new Promise((resolve, reject) => {
      setTimeout(() => {
        fetch(endpoint, {
          body: JSON.stringify([reqs]),
        })
          .then(async (res) => {
            if (!res.ok) {
              return Promise.reject(res);
            }
            const json = await res.json();
            resolve(json);
          })
          .catch((error) => {
            reject(error);
          })
          .finally(() => {
            promise = undefined;
            reqs = [];
          });
      }, 0);
    });

    return promise.then((json) => {
      if (!Array.isArray(json))
        throw new Error("Response should be an array")

      return json[index];
    })
  };

  const assignMethods = (schema) => {
    if (!Array.isArray(schema)) {
      throw new Error('Not a valid schema')
    }

    return schema.reduce((api, [name]) => {
      api[name] = (...args) => bulkFetch([name, ...args]);
      return api;
    }, api);
  };


  api.exec = bulkFetch

  return assignMethods(await castFunction(schema)(`${endpoint}/schema`));
}

export default FurverClient
