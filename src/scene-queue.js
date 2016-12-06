
import EE from "wolfy87-eventemitter";
import WickedTransition from "./wicked-transition";
import WickedScene from "./wicked-scene";
import debug from "debug";

const log = debug("sk:scene-queue");

export const ANIM_DURATION = 250;

// On node, just do nextFrame stuff async. On browser, do requestAnimationFrame.
let nextFrame = function(cb) {
  setTimeout(cb, 0);
};
if (typeof window !== "undefined" && window.requestAnimationFrame) {
  nextFrame = function(cb) {
    window.requestAnimationFrame(function() {
      window.requestAnimationFrame(cb);
    });
  };
}

export default class SceneQueue extends EE {
  constructor() {
    super();
    this.queue = [];
    this.scene = null;
    this._active = false;
  }

  pushScene(newScene) {
    if (!this.scene) {
      log("First scene, no queue necessary");
      this.scene = newScene;
      this.emit("scene", newScene);
      return;
    }
    const transitions = WickedTransition.findPath(this.scene, newScene);
    if (!transitions) {
      log("No path found, applying new scene instantly");
      // Couldn't find transitions to get us there, sad. Just go for it...
      this.scene = newScene;
      this.emit("scene", newScene);
      return;
    }
    log("Found path!", transitions);
    transitions.forEach((transition) => {
      log(`Applying ${transition.name}`);
      const {start, end} = transition.go(this.scene, newScene);
      console.log({start, end});
      this.queue.push(start, end, ANIM_DURATION);
    });
    this.queue.push(newScene);
    this.scene = newScene;
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
      log(`Delaying ${scene}ms, ${this.queue.length} items remain in queue`);
      return setTimeout(() => {
        this._active = false;
        this.processQueue();
      }, scene);
    }
    log(`Emitting scene, ${this.queue.length} items remain in queue`);
    this.emit("scene", scene);
    this._active = false;
    nextFrame(::this.processQueue);
  }
}
