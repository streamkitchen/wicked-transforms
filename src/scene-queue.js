
import EE from "wolfy87-eventemitter";
import WickedTransition from "./wicked-transition";

export default class SceneQueue extends EE {
  constructor() {
    super();
    this.queue = [];
    this.scene = null;
    this._active = false;
  }

  pushScene(scene) {
    if (!this.scene) {
      this.scene = scene;
      this.emit("scene", scene);
      return;
    }
    const transitions = WickedTransition.findPath(scene, this.scene);
    if (!transitions) {
      // Couldn't find transitions to get us there, sad. Just go for it...
      this.scene = scene;
      this.emit("scene", scene);
      return;
    }
    transitions.forEach((transition) => {
      this.queue.push(...transition.go(this.scene, scene));
    });
    this.scene = this.queue[this.queue.length - 1];
    this.processQueue();
  }

  processQueue() {
    if (this._active === true) {
      return;
    }
    if (this.queue.length === 0) {
      return;
    }
    this._active = true;
    const scene = this.queue.shift();
    if (typeof scene === "number") {
      return setTimeout(() => {
        this._active = false;
        this.processQueue();
      }, scene);
    }
    this.emit("scene", scene);
    this._active = false;
    this.processQueue();
  }
}
