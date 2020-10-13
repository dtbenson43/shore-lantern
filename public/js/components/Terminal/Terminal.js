class Terminal extends HTMLElement {
  constructor(options) {
    super(options);
    console.log('terminal ', options)
    this.innerHTML = '<div>hello</div>';
    this.frame = null;
  }
}

customElements.define("terminal-app", Terminal);


export default Terminal;