
import * as BunTest from 'bun:test'; // eslint-disable-line import/no-unresolved

import {
	SERVER_PORT,
	createServer,
	runTests    } from '@extws/test-driver';

import ExtWSBunDriver from '../src/main.js';

createServer(
	new ExtWSBunDriver({
		port: SERVER_PORT,
	}),
);

runTests({
	describe: BunTest.describe,
	test: ({
		name,
		test,
		timeout,
	}) => BunTest.test(
		name,
		test,
		timeout,
	),
});
