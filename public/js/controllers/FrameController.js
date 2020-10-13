class _FrameController {
  constructor(main) {
    // frameControllerInst = this;
    this.main = main || null;

    this._frames = {};
    this._framesHandler = {
      set: (...params) => {
        const [target, property, value, receiver] = params;
        const result = Reflect.set(...params);
        // setTimeout(() => {
        //   Controller.renderFrame(value);
        // });
        this.renderFrame(value);
        // Controller.renderFrames();
        return result;
      },
      deleteProperty: (...params) => {
        const result = Reflect.deleteProperty(...params);
        // Controller.renderFrames();
        return result;
      }
    }

    this.frames = new Proxy(this._frames, this._framesHandler);
  }

  addFrame(frame) {
    const key = frame.key;
    this.frames[key] = frame;
    return key;
  }

  deleteFrame(frame) {
    this.frames[frame.key];
  }

  setMain(main) {
    this.main = main;
  }

  getMain() {
    return this.main;
  }

  renderFrame(frame) {
    this.main.appendChild(frame);
    requestAnimationFrame(() => {
      Object.entries(this._frames).forEach(([,f], idx, array) => {
        if (frame.key === f.key) {
          f.state.active = true;
          if (!f.state.disableClickToFront) f.classList.add('frame-shadow');
          else f.classList.remove('frame-shadow');
        } else {
          f.state.active = false;
        }
      })
    }); 
  }

  renderFrames() {
    if (this.main != null) {
      Object.entries(this._frames).forEach(([,frame], idx, array) => {
        if (idx === array.length - 1) frame.frameNode.classList.add('frame-shadow');
        else if (frame.frameNode.classList.contains('frame-shadow'))
          frame.frameNode.classList.remove('frame-shadow');
        this.main.appendChild(frame.frameNode); 
      });
    }
  }
}

const frameController = new _FrameController();

export default frameController;