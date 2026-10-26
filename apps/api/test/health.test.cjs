const { test } = require('node:test');
const assert = require('node:assert/strict');
const { HealthService } = require('../dist/main.js');
test('readiness checks real PostgreSQL and Redis', {skip: !process.env.DATABASE_URL}, async () => {
 const result = await new HealthService().readiness();
 assert.equal(result.status, 'ready');
 assert.deepEqual(result.services, { postgres: 'up', redis: 'up' });
});
