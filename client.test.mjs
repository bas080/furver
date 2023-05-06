import { test } from 'tap'
import FurverClient from './client.mjs'

test('FurverClient', async (t) => {

  t.test('registers API endpoints from provided schema', async (t) => {
    const schema = [['foo', 1], ['bar', 2]];
    const fetch = async (url) => {
        return { json: () => schema };
    };
    const api = await FurverClient({ fetch, schema });
    t.equal(typeof api.foo, 'function');
    t.equal(typeof api.bar, 'function');
  });

  t.test('registers API endpoints from schema', async (t) => {
    const schema = async () => [['foo', 1], ['bar', 2]];
    const api = await FurverClient({ schema });
    t.equal(typeof api.foo, 'function');
    t.equal(typeof api.bar, 'function');
  });

  t.test('invokes API endpoints with correct arguments', async (t) => {
    const schema = [['add', 2]];
    const expectedArgs = [2, 3];
    let actualArgs;
    const fetch = async (url, options) => {
      const { body } = (options || {})
      const [[[name, ...args]]] = JSON.parse(body);

      actualArgs = args;
      return { ok: true, json: async () => [5] };

    };

    const api = await FurverClient({ schema, fetch });
    await api.add(...expectedArgs);
    t.same(actualArgs, expectedArgs);
  });

  t.test('returns undefined for unknown API endpoints', async (t) => {
    const schema = () => [['foo', 0]];
    const api = await FurverClient({ schema });
    t.equal(api.bar, undefined);
  });

  t.test('no errors when fetching schema and schema is provided', async (t) => {
    const fetch = async () => {
      throw new Error('Failed to fetch schema');
    };
    const schema = [['add', 2]];
    const api = await FurverClient({ fetch, schema });
    t.has(api, { add: api.add });
  });

  // Could add to improve debugging.
  t.test('rejected schema promise', async (t) => {
    const schema = Promise.reject(new Error())
    await t.rejects(() => FurverClient({ schema, fetch }));
  });

  t.test('handles non-OK status code', async (t) => {
    const schema = [['add', 2]];
    const fetch = async (url, options) => {
      const { body } = options;

      return { ok: false, statusText: 'Bad fetch' };
    };

    const api = await FurverClient({ schema, fetch });
    await t.rejects(() => api.add(2, 3));
  });

  t.test('handles invalid response format', async (t) => {
    const schema = [['add', 2]];
    const fetch = async () => {
      return { ok: true, json: async () => ({ result: 5 }) };
    };

    const api = await FurverClient({ schema, fetch });
    await t.rejects(() => api.add(2, 3));
  });

});
