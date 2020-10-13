import Utilities from "./libs/utilities.js";
import Frame from "./components/Frame/ConnectedFrame.js";
import socketController from "./controllers/SocketController.js";
import frameController from "./controllers/FrameController.js";
// import TestApp from "./testapp.js";
import Terminal from "./components/Terminal/Terminal.js";
import BlockController from "./components/BlockGrid/BlockController.js";
import ServerScript from "./components/ServerScript/ServerScript.js";
import LoadingBar from "./components/LoadingBar/LoadingBar.js";
// import "./vendor/pixi.min.js";

console.log(PIXI);
const main = document.getElementById("main");
frameController.setMain(main);

frameController.addFrame(
  new Frame({
    title: "Importing Scripts",
    x: 30,
    y: 100,
    height: 200,
    width: 500,
    app: LoadingBar
  })
);

const app = new PIXI.Application({
  width: 800, height: 600, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);

// Create a new texture
const texture = PIXI.Texture.from('https://cdn.glitch.com/1a1186ff-599d-4c07-af17-6061c6de2a21%2Fbunny.png?v=1602560857542');

// Create a 5x5 grid of bunnies
for (let i = 0; i < 25; i++) {
  const bunny = new PIXI.Sprite(texture);
  bunny.anchor.set(0.5);
  bunny.x = (i % 5) * 40;
  bunny.y = Math.floor(i / 5) * 40;
  container.addChild(bunny);
}

// Move container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

// Center bunny sprite in local container coordinates
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

// Listen for animate update
app.ticker.add((delta) => {
  // rotate the container!
  // use delta to create frame-independent transform
  container.rotation -= 0.01 * delta;
});

// const socket = new WebSocket((
//   (window.location.protocol === "https:")
//   ? "wss://"
//   : "ws://"
// ) + window.location.host);

// socket.addEventListener('open', function (event) {
//   console.log('opened')
//   socket.send(JSON.stringify({
//     test: 'test',
//     timestamp: Date.now()
//   }));
// });

// // Listen for messages
// socket.addEventListener('message', function (event) {
//   console.log('Message from server ', event.data);
// });  
