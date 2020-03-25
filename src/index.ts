'use strict';

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log('Master process is running with pid:', process.pid);

    for (let i = 0; i < numCPUs; ++i) {
        cluster.fork();
    }
} else {
    console.log('Worker started with pid:', process.pid);
}
