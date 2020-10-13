const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const generatePrimes = require('./primes');
const generateSum = require('./sums');

console.log(workerData);
parentPort.postMessage(generateSum(workerData.start, workerData.end));