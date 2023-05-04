import { test } from 'tap'
import FurverClient from './client.mjs'

test('FurverClient', async (t) => {
  t.test('registers API endpoints from schema', async (t) => {
    const schema = [['foo', 1], ['bar', 2]];
    const request = async (url) => {
      if (url === 'http://localhost:3000/schema') {
        return { json: () => schema };
      }
    };
    const api = await FurverClient({ request });
    t.equal(typeof api.foo, 'function');
    t.equal(typeof api.bar, 'function');
  });

  t.test('invokes API endpoints with correct arguments', async (t) => {
    const schema = [['add', 2]];
    const expectedArgs = [2, 3];
    let actualArgs;
    const request = async (url, options) => {
      const { body } = (options || {})

      if (url === 'http://localhost:3000/schema') {
        return { json: () => schema };
      }

      const [[[name, ...args]]] = JSON.parse(body);

      actualArgs = args;
      return { ok: true, json: async () => [5] };

    };

    const api = await FurverClient({ request });
    await api.add(...expectedArgs);
    t.same(actualArgs, expectedArgs);
  });

  t.test('returns undefined for unknown API endpoints', async (t) => {
    const schema = [['foo', 0]];
    const request = async (url) => {
      if (url === 'http://localhost:3000/schema') {
        return { json: () => schema };
      }
    };
    const api = await FurverClient({ request });
    t.equal(api.bar, undefined);
  });

  // Maybe improve by adding retries and stuff.
  t.skip('handles errors when fetching schema', async (t) => {
    const request = async () => {
      throw new Error('Failed to fetch schema');
    };
    const api = await FurverClient({ request });
    t.same(api, {});
  });
});
