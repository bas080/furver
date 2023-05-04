#!/usr/bin/env node

import schema from './schema.mjs';

(async function () {
  const { default: api } = await import(process.argv[2])
  console.log(JSON.stringify(schema(api)))
})()
