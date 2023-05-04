export default async function FurverClient({ method = 'post', endpoint = 'http://localhost:3000', request = fetch }) {
  const api = {};
  let promise;
  let reqs = [];

  const bulkFetch = (expr) => {
    const index = reqs.length;
    reqs.push(expr);

    promise = promise || new Promise((resolve, reject) => {
      setTimeout(() => {
        request(endpoint, {
          method,
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

    return promise.then((json) => json[index]);
  };

  const assignMethods = (schema) => {
    return schema.reduce((api, [name]) => {
      api[name] = (...args) => bulkFetch([name, ...args]);
      return api;
    }, api);
  };

  const fetchSchema = async () => {
    try {
      const schemaRes = await request(`${endpoint}/schema`);
      const schema = await schemaRes.json();
      return schema;
    } catch (error) {
      console.error('Failed to fetch schema:', error);
    }
  };

  api.exec = bulkFetch

  const schema = await fetchSchema();
  return assignMethods(schema);
}
