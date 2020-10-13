import Utilities from "../../libs/utilities.js";

class ServerScript extends HTMLElement {
  constructor(options) {
    super(options);
    this.frame = options.frame;

    this._state = {};
    this.state = new Proxy(this._state, {
      set: (...params) => this.handleStateChange(...params)
    });

    this.frame.state = new Proxy(this.frame._state, {
      set: (...params) => this.handleFrameStateChange(...params)
    });

    this.contents = document.createElement("div");
    Object.assign(this.contents.style, {
      position: "relative",
      top: "0px",
      left: "0px",
      width: "100%",
      height: "100%"
    });

    this.ready = false;
    this.appendChild(this.contents);
    Utilities.setInnerHTMLRefs(
      this.contents,
      // `
      //   <div 
      //     style="white-space: nowrap; width: calc(100% - 20px); margin: 0px 10px 0px 10px;"
      //   ><iframe width="200" height="180" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      //     <div>Server Name:</div>
      //     <input
      //       style="background-color: black; color: white; border: 1px solid #ccc;"
      //       ref="input"
      //     />
      //     <div>
      //       <button ref="button">Click me</button>
      //     </div>
      //     <div 
      //       style="white-space: normal;"
      //       ref="output"
      //     />
      //   </div>
      // `
      `<iframe
        ref="youtube"
        width="${this.frame.state.width-2}"
        height="${this.frame.state.height-48}"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
      />`
    ).then(refs => {
      this.youtube = refs.youtube;
      // console.log(this.youtube);

      // this.input = refs.input;
      // this.input.addEventListener("input", event => {
      //   this.state.input = event.target.value;
      // });
      // this.output = refs.output;
      // this.button = refs.button;
      // console.log(this.input, this.button);
      // this.button.addEventListener("click", async event => {
      //   const { count } = await (await fetch("/gameDataCount")).json();
      //   let data = await (await fetch(`/gameData/1/${count}`)).json();

      //   const numFromId = id =>
      //     parseInt(
      //       id
      //         .split("-")
      //         .map(part => `${parseInt(part, 16)}`)
      //         .join()
      //     );

      //   data = data.map(
      //     ({
      //       hashIndex,
      //       index,
      //       id,
      //       randomNumber,
      //       previous1CrashPoint,
      //       previous1Hash,
      //       previous1RandomNumber,
      //       previous2CrashPoint,
      //       previous2Hash,
      //       previous2RandomNumber,
      //       crashPoint
      //     }) => [
      //       {
      //         hashIndex,
      //         index,
      //         id: numFromId(id),
      //         randomNumber,
      //         previous1CrashPoint,
      //         previous1Hash: parseInt(previous1Hash, 16),
      //         previous1RandomNumber,
      //         previous2CrashPoint,
      //         previous2Hash: parseInt(previous2Hash, 16),
      //         previous2RandomNumber
      //       },
      //       { crashPoint }
      //     ]
      //   );

      //   const nn = ml5.neuralNetwork({
      //     inputs: Object.keys(data[0][0]),
      //     outputs: Object.keys(data[0][1]),
      //     task: "regression",
      //     debug: true
      //   });

      //   console.log(data);

      //   data.forEach(([inputs, output]) => {
      //     nn.addData(inputs, output);
      //   });
      //   nn.normalizeData();
      //   nn.train(
      //     {
      //       epochs: 100,
      //       batchSize: 100
      //     },
      //     () => {
      //       let losses = 0;
      //       let wins = 0;

      //       data.forEach(([input, output]) => {
      //         nn.predict(input, (error, result) => {
      //           if (error) console.warn(error);
      //           else {
      //             if (result[0].value <= output.crashPoint) wins += 1;
      //             else losses += 1;
      //             // console.log(result);

      //             // let con1 = 0;
      //             // let con2 = 0;
      //             // result.forEach(r => {
      //             //   if (r.label >= 1.2) con1 += r.confidence;
      //             //   else con2 += r.confidence;
      //             // });
      //             // let pred = result[0];
      //             // if (pred >= crashPoint) {
      //             //   wins += 1;
      //             // } else {
      //             //   losses += 1;
      //             // }
      //             // console.log('correct', wins, 'wrong', losses);
      //             // console.log(crashPoint, 'prediction:', con1 ,con1 > 0.94 ? 'win' : 'loss', 'actual:', crashPoint >= 1.2 ? 'win' : 'loss');
      //             console.log(result[0].value, output.crashPoint)
      //             console.log(wins, losses);
      //           }
      //         });
      //       });
      //     }
      //   );
      // });
      this.ready = true;
    });
  }

  renderInput(value) {
    // console.log(value);
    this.input.value = value === "dude" ? "my dude" : value;
    this.output.innerText = value === "dude" ? "my dude" : value;
  }

  handleResize() {
    const { width, height } = this.frame.state;
    // console.log(this.frame.state.width, this.frame.state.height);
    this.youtube.setAttribute('width', width-2);
    this.youtube.setAttribute('height', height-48);
  }

  handleStateChange(...params) {
    if (this.ready) {
      const [target, property, value, receiver] = params;
      const result = Reflect.set(...params);

      const update = {
        input: () => this.renderInput(value)
      };

      const runUpdate = update[property];
      if (runUpdate) runUpdate();
      return result;
    }
  }

  handleFrameStateChange(...params) {
    const [target, property, value, receiver] = params;
    let result;

    const update = {
      width: () => this.handleResize(),
      height: () => this.handleResize()
    };

    const runUpdate = update[property];
    if (runUpdate) runUpdate();
    return this.frame.handleStateChange(...params);
  }
}
customElements.define("server-script", ServerScript);

export default ServerScript;
