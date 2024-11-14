import Component from "./component.js";

const render = (app: Component, root: HTMLElement) => {
    root.appendChild(app._el);
}

export default render;