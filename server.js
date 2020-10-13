// dependencies
const express = require("express");
const webSocket = require("ws");
const http = require("http");
const { uuid } = require("uuidv4");
const sqlite3 = require("sqlite3").verbose();
const sqliteAsync = require("./libs/sqliteAsync");
const fs = require("fs");
const games = require("./libs/gameHash");
const generatePrimes = require("./libs/primes");
const { Worker, isMainThread, parentPort } = require('worker_threads');
const { errorMonitor } = require("events");

// constants
const { DB_FILE, GAME_HASH, NUM_GAMES, MIN_MULTIPLIER, MAX_MULTIPLIER, MULTIPLIER_STEP_SIZE, MAX_BET, BET_STEP_SIZE } = process.env;

// init app
const app = express();
const server = http.createServer(app);
const webSocketServer = new webSocket.Server({ server });
const db = sqliteAsync(new sqlite3.Database(DB_FILE));

// crash points memory
let generatingData = false;
let data = null;

// db.exec(`DROP TABLE IF EXISTS games;`, (err) => err ? console.log : null);

const verifyGamesTable = async () => {
  try {
    const tableExists = await db.getAsync(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='games';`
    );
    if (!tableExists) {
      console.log("creating");
      await db.execAsync(
        `CREATE TABLE games (
          gameResult TEXT
        )`
      );
    }
    // countAndAdd();
  } catch (err) {
    console.warn(err);
  }
};

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/gameData/:startId/:num", async function(request, response) {
  const { startId, num } = request.params;
  try {
    const data = await db.allAsync(`SELECT
      g1.rowid,
      g1.gameResult,
      g2.gameResult as previousGame1,
      g3.gameResult as previousGame2
    FROM games g1
    JOIN games g2 on g2.rowid = g1.rowid - 1
    JOIN games g3 on g3.rowid = g1.rowid - 2
    WHERE g1.rowid >= ${startId}
    LIMIT ${num};`);
    const newData = data
      .map(({ rowid, gameResult, previousGame1, previousGame2 }) => ({
        rowid,
        gameResult: JSON.parse(gameResult),
        previousGame1: JSON.parse(previousGame1),
        previousGame2: JSON.parse(previousGame2)
      }))
      .filter(
        ({ gameResult, previousGame1, previousGame2 }) =>
          previousGame2.hash == previousGame1.previousHash &&
          previousGame1.hash == gameResult.previousHash &&
          previousGame2.crashPoint &&
          previousGame1.crashPoint &&
          gameResult.crashPoint
      )
      .map(({ gameResult, previousGame1, previousGame2 }) => ({
        ...gameResult,
        previous1CrashPoint: previousGame1.crashPoint,
        previous1Hash: previousGame1.hash,
        previous1RandomNumber: previousGame1.randomNumber,
        previous2CrashPoint: previousGame2.crashPoint,
        previous2Hash: previousGame2.hash,
        previous2RandomNumber: previousGame2.randomNumber
      }));
    console.log(newData[0]);
    response.json(newData);
  } catch (err) {
    console.warn(err);
    response.status(502).end();
  }
});

app.get("/gameDataCount", async function(request, response) {
  const data = await db.getAsync("SELECT COUNT(*) AS count FROM games");
  response.json(data);
});


/***********************************\
|*     GENERATE CRASH POINTS       *|
\***********************************/

const generateData = () => new Promise((res, rej) => {
  if (!generatingData && data == null) {

    console.log('generating hashes');
    
    let label = 'generate crash points'
    
    generatingData = true;
    
    const worker = new Worker("./dataWorker.js", {
      workerData: {
        hash: GAME_HASH,
        num: Number(NUM_GAMES),
        minMultiplier: Number(MIN_MULTIPLIER),
        maxMultiplier: Number(MAX_MULTIPLIER),
        stepMultiplier: Number(MULTIPLIER_STEP_SIZE),
        maxBet: Number(MAX_BET),
        stepBet: Number(BET_STEP_SIZE)
      }
    });
  
    console.time(label)
    worker.on('error', (err) => {
      generatingData = false;
      data = null;
      console.log(err);
    });
    worker.on('exit', () => {
      generatingData = false;
      console.log('Thread exiting');
      console.timeEnd(label);
      
    })
    worker.on('message', (msg) => {
      data = msg;
      res(data);
      // console.log(msg);
    });
  } else {
    res(data);
  }
})

/***********************************\
|*           THREAD TESTS          *|
\***********************************/

let started = false;

let count = 1;

const work = () => {
  const min = 2;
  const max = 1e7;

  let label = `primes${count}`;
  const worker = new Worker("./simpleWorker.js", {
    workerData: {
      start: 0,
      end: 10000000000
    }
  });

  console.time(label)
  worker.on('error', (err) => { console.log(err) });
  worker.on('exit', () => {;
    console.log('Thread exiting');
    console.timeEnd(label);
  })
  worker.on('message', (msg) => {
    // console.log('message', msg);
  });

  // console.time(label);
  // generatePrimes(min, max);
  // console.timeEnd(label);
}

app.get("/start", async function(request, response) {
  const data = await generateData();
  console.log(data);
  response.json({ data });
});

app.get("/stop", async function(request, response) {
  console.log(games.calculateBank(100, 1.8, 5));
  response.json({ data: 'completed' });
});

/***********************************\
|*          SOCKET SERVER          *|
\***********************************/

const socketActions = {
  handshake: (ws, message) => {
    const { data } = message;
    console.log(data);
    if (data) ws.clientId = data;
    else ws.clientId = uuid();
    ws.send(
      JSON.stringify({
        action: "onhandshake",
        data: ws.clientId
      })
    );
  },
  updateGameData: (ws, message) => {
    console.log(message);
    db.run(
      `INSERT INTO games VALUES ('${JSON.stringify(message.data)}');`,
      [],
      err => {
        if (err) console.error(err);
        else console.log("inserted");
      }
    );
  }
};

webSocketServer.on("connection", function connection(ws) {
  console.log("connected");
  ws.on("message", message => {
    try {
      message = JSON.parse(message);
    } catch (err) {
      console.warn(err);
      return;
    }
    const { action } = message;
    if (socketActions[action]) {
      socketActions[action](ws, message);
    }
  });
});

verifyGamesTable();

server.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + server.address().port);
});
