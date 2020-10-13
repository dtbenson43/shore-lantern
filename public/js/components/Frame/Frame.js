import frameController from "../../controllers/FrameController.js";
import socketController from "../../controllers/SocketController.js";
import Utilities from "../../libs/utilities.js";

class Frame extends HTMLElement {
  constructor(options) {
    const self = super(options);
    options = options ? options : {};

    this.key = Utilities.uniqueUUIDv4();

    this._state = {};
    this.state = new Proxy(this._state, {
      set: (...params) => this.handleStateChange(...params)
    });

    this.frameBody = document.createElement("div");
    this.appendChild(this.frameBody);

    this.className = "frame";
    this.frameBody.style.height = "100%";
    this.frameBody.className = "frame-body";
    
    this.enableStatus();
    this.enableTitle();
    this.enableDrag();
    this.enableResize();
    this.enableClickToFront();

    Object.assign(this.state, options);

    return self;
  }

  setPosition(x, y) {
    Object.assign(this.state, { x, y });
  }

  setSize(width, height) {
    Object.assign(this.state, { width, height });
  }

  enableTitle() {
    if (this.state.disableTitle !== false)
      return (this.state.disableTitle = false);
    this.frameTitle = document.createElement("div");
    this.frameTitle.className = "frame-title";
    this.prepend(this.frameTitle);
    if (this.frameStatus) this.frameBody.style.height = "calc(100% - 48px)";
    else this.frameBody.style.height = "calc(100% - 24px)";
    if (!this.state.disableDrag) this.enableDrag();
    if (this.state.title) this.state.title = this.state.title;
  }

  disableTitle() {
    if (this.state.disableTitle !== true)
      return (this.state.disableTitle = true);
    if (this.frameTitle) this.removeChild(this.frameTitle);
    this.frameTitle = null;
    if (this.frameStatus) this.frameBody.style.height = "calc(100% - 24px)";
    else this.frameBody.style.height = "100%";
  }

  setTitle(value) {
    if (this.state.disableTitle || !this.frameTitle) return;
    if (value !== this.state.title) return (this.state.title = value);
    const id = `${this.key}-title-text`;
    const oldTitle = document.getElementById(id);
    if (oldTitle) oldTitle.parentElement.removeChild(oldTitle);
    const titleText = document.createElement("div");
    titleText.className = "frame-title-text";
    titleText.id = id;
    titleText.innerText = value;
    this.frameTitle.prepend(titleText);
  }

  enableStatus() {
    if (this.state.disableStatus !== false)
      return (this.state.disableStatus = false);
    this.frameStatus = document.createElement("div");
    this.frameStatus.className = "frame-status";
    this.insertBefore(this.frameStatus, this.frameBody.nextSibling);
    if (this.frameTitle) this.frameBody.style.height = "calc(100% - 48px)";
    else this.frameBody.style.height = "calc(100% - 24px)";
  }

  disableStatus() {
    if (this.state.disableStatus !== true)
      return (this.state.disableStatus = true);
    if (this.frameStatus) this.removeChild(this.frameStatus);
    this.frameStatus = null;
    if (this.frameTitle) this.frameBody.style.height = "calc(100% - 24px)";
    else this.frameBody.style.height = "100%";
  }

  enableDrag() {
    if (this.state.disableDrag !== false)
      return (this.state.disableDrag = false);
    if (this.frameTitle) {
      this.frameTitle.onmousedown = e => {
        e.preventDefault();
        this.state.dragging = true;
        this.frameBody.style.pointerEvents = 'none';

        let xPrevious = e.clientX;
        let yPrevious = e.clientY;
        
        const mouseMoveHandler = e => {
          this.state.x = this.state.x + e.clientX - xPrevious;
          this.state.y = this.state.y + e.clientY - yPrevious;
          xPrevious = e.clientX;
          yPrevious = e.clientY;
        };

        const removeHandler = () => {
          if (this.state.y < 1) this.state.y = 1;
          frameController.main.removeEventListener("mousemove", mouseMoveHandler);
          frameController.main.removeEventListener("mouseup", removeHandler);
          frameController.main.removeEventListener("mouseleave", removeHandler);

          this.state.dragging = false;
          this.frameBody.style.pointerEvents = 'auto';
        };

        frameController.main.addEventListener("mousemove", mouseMoveHandler);
        frameController.main.addEventListener("mouseup", removeHandler);
        frameController.main.addEventListener("mouseleave", removeHandler);
      };
    }
  }

  disableDrag() {
    if (this.state.disableDrag !== true) return (this.state.disableDrag = true);
    if (this.frameTitle) this.frameTitle.onmousedown = null;
  }

  enableResize() {
    if (this.state.disableResize !== false)
      return (this.state.disableResize = false);
    const resizeButton = document.createElement("i");
    resizeButton.id = `${this.key}-resize`;
    resizeButton.className = "fas fa-caret-right frame-resize";
    this.append(resizeButton);
    resizeButton.onmousedown = e => {
      e.preventDefault();
      this.state.resizing = true;
      this.frameBody.style.pointerEvents = 'none';

      let xPrevious = e.clientX;
      let yPrevious = e.clientY;

      const mouseMoveHandler = e => {
        let newWidth = this.state.width + e.clientX - xPrevious;
        let newHeight = this.state.height + e.clientY - yPrevious;

        this.state.width = newWidth < 48 ? 48 : newWidth;
        this.state.height = newHeight < 48 ? 48 : newHeight;

        xPrevious = newWidth < 48 ? xPrevious : e.clientX;
        yPrevious = newHeight < 48 ? yPrevious : e.clientY;
      };

      const removeHandler = () => {
        frameController.main.removeEventListener("mousemove", mouseMoveHandler);
        frameController.main.removeEventListener("mouseup", removeHandler);
        frameController.main.removeEventListener("mouseleave", removeHandler);

        this.state.resizing = false;
        this.frameBody.style.pointerEvents = 'auto';
      };

      frameController.main.addEventListener("mousemove", mouseMoveHandler);
      frameController.main.addEventListener("mouseup", removeHandler);
      frameController.main.addEventListener("mouseleave", removeHandler);
    };
  }

  disableResize() {
    if (this.state.disableResize !== true)
      return (this.state.disableResize = true);
    const resizeElement = document.getElementById(`${this.key}-resize`);
    if (resizeElement) resizeElement.parentElement.removeChild(resizeElement);
  }

  enableClickToFront() {
    if (this.state.disableClickToFront !== false)
      return (this.state.disableClickToFront = false);
    // this.onmousedown = () => {
    //   frameController.addFrame(this);
    // };
    this.mouseDownListener = this.addEventListener("mousedown", event => {
      if (!this.state.active) frameController.addFrame(this);
    })
  }

  disableClickToFront() {
    if (this.state.disableClickToFront !== true)
      return (this.state.disableClickToFront = true);
    this.removeEventListener(this.mouseDownListener);
  }

  enableShadow() {
    if (this.state.disableShadow !== false)
      return (this.state.disableShadow = false);
    this.classList.remove("frame-no-shadow");
  }

  disableShadow() {
    if (this.state.disableShadow !== true)
      return (this.state.disableShadow = true);
    this.classList.add("frame-no-shadow");
  }

  setApp(app) {
    Utilities.removeChildren(this.frameBody);
    this.frameBody.appendChild(new app({ frame: this, ...this.state }));
  }

  handleStateChange(...params) {
    const [target, property, value, receiver] = params;
    const result = Reflect.set(...params);

    const update = {
      x: () => (this.style.left = `${value}px`),
      y: () => (this.style.top = `${value}px`),
      height: () => (this.style.height = `${value}px`),
      width: () => (this.style.width = `${value}px`),
      title: () => this.setTitle(value),
      app: () => this.setApp(value),
      socketDate: () => this.onSocketData(value),
      disableTitle: () => {
        if (value === true) this.disableTitle();
        else this.enableTitle();
      },
      disableStatus: () => {
        if (value === true) this.disableStatus();
        else this.enableStatus();
      },
      disableDrag: () => {
        if (value === true) this.disableDrag();
        else this.enableDrag();
      },
      disableResize: () => {
        if (value === true) this.disableResize();
        else this.enableResize();
      },
      disableClickToFront: () => {
        if (value === true) this.disableClickToFront();
        else this.enableClickToFront();
      },
      disableShadow: () => {
        if (value === true) this.disableShadow();
        else this.enableShadow();
      }
    };

    const runUpdate = update[property];
    if (runUpdate) runUpdate();
    return result;
  }
}

customElements.define("frame-container", Frame);

export default Frame;
