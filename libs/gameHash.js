const exactMath = require('exact-math');
const crypto = require("crypto");

// const numGames = 300000;
const crashHash =
  "6911aed756e4f70a29f0a9b42151cd297b09b13a9397229c1c7abd06747ad68f";
  // "ff6287a9993db9d2b687b6f7608cd30d6d3935c98f594d42a96e4fcfcdbaa307";
  // "1456da2887e8d576f4211d958dcd11337efe9c0faebe75862b5ee265da703be3";
  // "152a4978c95334bd4875b7b7d198015f6bdcb31d82115f180b28cd72155cbbcc";
  // "6911aed756e4f70a29f0a9b42151cd297b09b13a9397229c1c7abd06747ad68f";
// Hash from bitcoin block #610546. Public seed event: https://twitter.com/Roobet/status/1211800855223123968
const salt = "0000000000000000000fa3b65e43e4240d71762a5bf397d5304b2596d116859c";

function saltHash(hash) {
  return crypto
    .createHmac("sha256", hash)
    .update(salt)
    .digest("hex");
}

function generateHash(seed) {
  return crypto
    .createHash("sha256")
    .update(seed)
    .digest("hex");
}

function divisible(hash, mod) {
  // We will read in 4 hex at a time, but the first chunk might be a bit smaller
  // So ABCDEFGHIJ should be chunked like  AB CDEF GHIJ
  var val = 0;

  var o = hash.length % 4;
  for (var i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
    val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
  }

  return val === 0;
}

function crashPointFromHash(serverSeed) {
  const hash = crypto
    .createHmac("sha256", serverSeed)
    .update(salt)
    .digest("hex");

  const hs = parseInt(100 / 4);
  if (divisible(hash, hs)) {
    return 1;
  }

  const h = parseInt(hash.slice(0, 52 / 4), 16);
  const e = Math.pow(2, 52);

  return Math.floor((100 * e - h) / (e - h)) / 100.0;
}

function getPreviousGames(hash, numGames) {
  const previousGames = [];
  previousGames.push({ hash, gameResult: crashPointFromHash(hash) });
  let gameHash = generateHash(hash);

  for (let i = 0; i < numGames - 1; i++) {
    const gameResult = crashPointFromHash(gameHash);
    previousGames.push({ gameHash, gameResult });
    gameHash = generateHash(gameHash);
  }

  return previousGames;
}

function getLosingStreaks(games, maxMultiplier, step) {
  const streaks = [];
  // console.log(maxMultiplier, typeof step, 1 + step)
  for (let m = exactMath.add(1, step); m < maxMultiplier; m = exactMath.add(m, step)) {
    // console.log(m);
    let currentStreak = 0;
    let longestStreak = 0;
    games.forEach(({ gameResult }) => {
      let loss = false;
      if (gameResult < m) {
        currentStreak += 1;
      } else {
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
        currentStreak = 0;
      }
    });
    streaks.push([m, longestStreak]);
  }
  return streaks;
}

function getLosingStreak(games, multiplier) {
  let currentStreak = 0;
  let longestStreak = 0;
  games.forEach(({ gameResult }) => {
    if (gameResult < multiplier) {
      currentStreak += 1;
    } else {
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      currentStreak = 0;
    }
  });
  return [multiplier, longestStreak];
}

function getStreaks(games, multiplier) {
  let currentStreak = 0;
  let longestStreak = 0;
  let streaks = [];
  games.forEach(({ gameResult }) => {
    if (gameResult < multiplier) {
      currentStreak += 1;
    } else {
      // if (currentStreak > longestStreak) {
      //   longestStreak = currentStreak;
      // }
      while(streaks[currentStreak] === undefined) {
        streaks.push(0);
      }
      streaks[currentStreak] += 1;
      currentStreak = 0;
    }
  });
  return streaks;
}

function profit(bet, multi) {
  return bet * multi;
}

// function calculateBank(bet, multi, streak) {
//   let losses = 0;
//   const profit = (bet * multi - bet);
//   for (let s = 1; s < streak; s += 1) {
//     losses += ((losses + profit) / multi);
//   }
//   return losses;
// }

function calculateBank(bet, multi, streak) {
  let losses = bet;
  let p = 0 //0.01;
  for (let s = 1; s <= streak; s += 1) {
    let nextBet = exactMath.div(
      losses,
      exactMath.sub(multi, 1)
    );
    if (nextBet <= 0.1) nextBet = 0.1;
    const roundedNB = exactMath.ceil(nextBet, -18);
    let newLosses = roundedNB;
    let addedLosses = exactMath.add(losses, newLosses);
    // console.log(losses, newLosses, addedLosses);
    losses = addedLosses; 
  }
  return losses;
}

function getBetBankData(games, minMultiplier, maxMultiplier, stepMultiplier, maxBet, stepBet, postMessage) {
  let results = [];
  for (let m = minMultiplier; m < maxMultiplier; m = exactMath.add(m, stepMultiplier)) {
    const [,streak] = getLosingStreak(games, m);
    for (let b = stepBet; b < maxBet; b = exactMath.add(b, stepBet)) {
      // console.log(b);
      const bank = calculateBank(b, m, streak);
      results.push([ m, streak, b, bank, (b * m - b) ]);
      if (Number.isInteger(b)) {
        // postMessage(results);
        // console.log(results);
      };
    }
  }
  return results
}

module.exports = {
    crashPointFromHash,
    generateHash,
    getPreviousGames,
    getLosingStreaks,
    getLosingStreak,
    getStreaks,
    calculateBank,
    // calculateBankNew,
    getBetBankData
}