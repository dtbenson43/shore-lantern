const { parentPort, workerData } = require('worker_threads');
const { getPreviousGames, getBetBankData, getLosingStreak, getStreaks } = require("./gameHash");
const { hash, num, minMultiplier, maxMultiplier, stepMultiplier, maxBet, stepBet } = workerData;
console.log(workerData);

let data = null;
if (hash && num && maxMultiplier && stepMultiplier && maxBet && stepBet) {
  const games = getPreviousGames(hash, num);
  // const bankData = getBetBankData(games, minMultiplier, maxMultiplier, stepMultiplier, maxBet, stepBet, (e) => parentPort.postMessage(e));
  const streaks = getStreaks(games, 100);

  data = streaks;
}

parentPort.postMessage(data);