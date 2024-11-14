import { App } from "./components/App.js";
import render from "./lib/render.js";

render(new App({}), document.getElementById("root") as HTMLElement);