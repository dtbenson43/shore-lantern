import frameController from "../../controllers/FrameController.js";
import Utilities from "../../libs/utilities.js";
import BlockGrid from "./BlockGrid.js";
import Frame from "../Frame/Frame.js";

class BlockController extends HTMLElement {
  constructor(options) {
    super(options);
    this.frame = options.frame;

    this._state = {};
    this.state = new Proxy(this._state, {
      set: (...params) => this.handleStateChange(...params)
    });
    
    this.blockContainer = new Frame({
      title: 'Block Grid',
      x: options.x + options.width + 10,
      y: options.y,
      height: 800,
      width: 900,
      app: BlockGrid
    });
    frameController.addFrame(this.blockContainer);
  }

  handleStateChange(...params) {
    const [target, property, value, receiver] = params;
    const result = Reflect.set(...params);

    const update = {
      grid: () => this.renderGrid(value)
    };

    const runUpdate = update[property];
    if (runUpdate) runUpdate();
    return result;
  }
}

customElements.define("blockgrid-controller", BlockController);

export default BlockController;
