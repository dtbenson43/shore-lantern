import Utilities from "../libs/utilities.js";

class SocketController {
  constructor(address) {
    this.socketURL = address || (
      (window.location.protocol === "https:")
      ? "wss://"
      : "ws://"
    ) + 'shore-lantern.glitch.me'//window.location.host;
    this.subscriptions = {};
    this.clientId = localStorage.getItem('clientId');
    this.connect();
  }

  connect() {
    console.log('socket connecting');
    this.webSocket = new WebSocket(this.socketURL);

    this.webSocket.onclose = this.onclose.bind(this);
    this.webSocket.onerror = this.onerror.bind(this);
    this.webSocket.onmessage = this.onmessage.bind(this);
    this.webSocket.onopen = this.onopen.bind(this);
  }

  onclose(event) {
    this.connect();
  }

  onerror(event) {
    console.log('socket error:', event);
  }

  onmessage({ data: message }) {
    console.log('message:', message);
    try {
      message = JSON.parse(message);
    } catch(err) {
      console.warn(err);
      return
    }
    const { action, data } = message;
    if (this[action]) this[action](data);
  }

  onopen(event) {
    console.log('sending uuid')
    this.webSocket.send(JSON.stringify({
      action: 'handshake',
      data: this.clientId
    }));
  }

  onhandshake(data) {
    if (data) {
      localStorage.setItem('clientId', data);
      this.clientId = data;
    }
  }

  subscribe(key, dataProxy) {
    const uuid = Utilities.uniqueUUIDv4();
    if (!this.subscriptions[key]) this.subscriptions[key] = {};
    Object.assign(this.subscriptions[key], {
      uuid: dataProxy
    });
  }
}

const _SocketController = new SocketController();

export default _SocketController;