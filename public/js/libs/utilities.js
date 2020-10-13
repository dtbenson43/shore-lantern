class Utilities {
  static UUIDSet = new Set();

  static uniqueUUIDv4() {
    let UUID = Utilities.UUIDv4();
    while (Utilities.UUIDSet.has(UUID)) {
      UUID = Utilities.UUIDv4();
    }
    Utilities.UUIDSet.add(UUID);
    return UUID;
  }

  static recoverUniqueUUIDv4(UUID) {
    Utilities.UUIDSet.delete(UUID);
  }

  static UUIDv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  static removeChildren(parentNode) {
    if (parentNode && parentNode.firstChild) {
      while (parentNode.firstChild) {
        parentNode.removeChild(parentNode.firstChild);
      }
    }
  }

  static setInnerHTMLRefs(parent, html, targets) {
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(mutations => {
        const refs = {};
        const traverseAndExecute = nodes => {
          nodes.forEach(node => {
            if (node.getAttribute) {
              const key = node.getAttribute("ref");
              if (key !== null) {
                refs[key] = node;
              }
            }
            if (node.children && node.children.length) {
              const nextNodes = [];
              for (let item of node.children) {
                nextNodes.push(item);
              }
              traverseAndExecute(nextNodes);
            }
          });
        };
        mutations.forEach(({ addedNodes }) => traverseAndExecute(addedNodes));
        resolve(refs);
        observer.disconnect();
      });
      observer.observe(parent, { subtree: true, childList: true });
      parent.innerHTML = html;
    });
  }

  static getRandomIntExlcusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  static getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export default Utilities;
