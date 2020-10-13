import Frame from './Frame.js';

class ConnectedFrame extends Frame {
  constructor(options) {
    const self = super(options);

    return self;
  }
}

customElements.define("connected-frame-container", ConnectedFrame);

export default ConnectedFrame;