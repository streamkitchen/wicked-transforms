
import EE from "wolfy87-eventemitter";
import WickedTransition from "./wicked-transition";
import WickedScene from "./wicked-scene";
import debug from "debug";
import {ANIM_DURATION} from "./constants";

const log = debug("sk:scene-queue");

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
      return;
    }
    let transitions = WickedTransition.findPath(this.scene, newScene);
    if (!transitions) {
      log(`No path found, applying instantly.`);
      transitions = [];
    }
    let currentScene = this.scene;
    transitions.forEach((transition) => {
      log(`Applying ${transition.name}`);
      const after = transition.getAfter(currentScene, newScene);
      console.log(`After ${transition.name}, I have ${after.regions.length}`);
      const stubScene = transition.go(currentScene, after);
      currentScene = after;
      this.queue.push(...stubScene);
      this.queue.push(after);
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
    console.log(`Drawing ${scene.regions.length} things`);
    this.emit("scene", scene);
    this._active = false;
    nextFrame(::this.processQueue);
  }
}
