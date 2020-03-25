
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

// master variables
const clusterMap = {};

// worker variables
let workerId;

// setup workers
if (cluster.isMaster) {

    console.log('Master process is running with pid:', process.pid);

    // spawn workers
    for (let i = 0; i < numCPUs; ++i) {
        const worker = cluster.fork();

        // setup listener for this worker on master
        worker.on('message', function (message) {
            console.log(`Master received message from worker ${clusterMap[worker.process.pid]}: ${message.msg}`);
        });
    }

    // send message to each worker
    const workerKeys = Object.keys(cluster.workers);
    workerKeys.forEach(key => {
        const worker = cluster.workers[key];
        clusterMap[worker.process.pid] = key;
        worker.send({msg: 'Message from master', customId: key});
    });

    // Be notified when workers die
    cluster.on('disconnect', function(worker) {
        console.log('Worker ' + clusterMap[worker.process.pid] + ' died');
    });

} else if (cluster.isWorker) {

    console.log('Worker started with pid:', process.pid);

    // setup listener on worker
    process.on('message', function(message) {
        if (message && message.msg && message.customId) {
            workerId = message.customId;
            console.log(`Worker ${workerId} received message: ${message.msg}`)

            // send message back to master
            process.send({msg: 'Message from worker'});

            // kill worker
            cluster.worker.disconnect();
        }
    });

}

