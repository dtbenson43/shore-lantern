import Utilities from "../../libs/utilities.js";

class BlockGrid extends HTMLElement {
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
    
    this.gridContainer = document.createElement("div");
    this.gridContainer.className = "grid-container";
    this.appendChild(this.gridContainer);

    this.gridColors = ["red", "green", "blue"];

    this.state.grid = this.generateGrid();
  }

  generateGrid() {
    const size = Utilities.getRandomIntInclusive(100, 100);
    const grid = Array.from({ length: size }, (v, i) =>
      Array.from({ length: size }, (v, i) => {
        const colorNum = Utilities.getRandomIntInclusive(0, 2);
        return this.gridColors[colorNum];
      })
    );
    return grid;
  }

  renderGrid(grid) {
    Utilities.removeChildren(this.gridContainer);
    const size = grid.length;
    grid.forEach((row, rowIdx) => {
      const rowElem = document.createElement("div");
      rowElem.style.height = `calc(100% / ${size})`;
      rowElem.className = "grid-row";
      row.forEach((color, colIdx) => {
        const colElem = document.createElement("div");
        colElem.classList.add("grid-col");
        colElem.style.width = `calc(100% / ${size})`;
        colElem.style.backgroundColor = color;
        rowElem.appendChild(colElem);
      });
      this.gridContainer.appendChild(rowElem);
    });
    
    setTimeout(() => this.scanGrid(), 5000);
  }

  scanGrid() {
    const arr = [null];
    arr.forEach((group, index, array) => {
      array[index] = [];
      this.state.grid.forEach((row, rowIdx) => {
        let previousBlock = null;
        row.forEach((blockColor, colIdx) => {
          const blockElem = this.gridContainer.childNodes[rowIdx].childNodes[
            colIdx
          ];
          // setTimeout(() => blockElem.style.backgroundColor = "black");
        });
      });
      console.log('running')
      array.push([]);
    });
    console.log(arr);
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

  handleFrameStateChange(...params) {
    const [target, property, value, receiver] = params;
    let result;

    const update = {
      dragging: () => {
        // if (!value) this.appendChild(this.gridContainer);
        // else Utilities.removeChildren(this);
      },
      resizing: () => {
        // if (!value) this.appendChild(this.gridContainer);
        // else Utilities.removeChildren(this);
      }
    };

    const runUpdate = update[property];
    if (runUpdate) runUpdate();
    return this.frame.handleStateChange(...params);
  }
}

customElements.define("blockgrid-container", BlockGrid);

export default BlockGrid;
