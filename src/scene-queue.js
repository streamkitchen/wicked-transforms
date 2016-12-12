
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
    this._holding = false;
  }

  next() {
    this._holding = false;
    this.processQueue();
  }

  pushScene(newScene) {
    if (!this.scene) {
      log("First scene, no queue necessary");
      this.scene = newScene;
      return;
    }
    let result = WickedTransition.findPath(this.scene, newScene);
    if (!result) {
      console.error(`No path found, applying instantly.`);
      result = {
        transitions: [],
        scenePath: [],
      };
    }
    let {transitions, scenePath} = result;
    let currentScene = this.scene;
    log(`Applying path: [${transitions.map(t => t.name).join(', ')}]`)
    transitions.forEach((transition, i) => {
      const stubScene = transition.go(currentScene, scenePath[i]);
      currentScene = scenePath[i];
      this.queue.push(...stubScene);
      this.queue.push(currentScene);
    });
    this.queue.push(newScene);
    this.scene = newScene;
    this.processQueue();
  }

  processQueue() {
    if (this._active === true) {
      return;
    }
    if (this._holding === true) {
      return;
    }
    if (this.queue.length === 0) {
      return;
    }
    this._active = true;
    this._holding = true;
    const scene = this.queue.shift();
    // log(`Emitting scene, ${this.queue.length} items remain in queue`);
    this.emit("scene", scene);
    this._active = false;
    nextFrame(::this.processQueue);
  }
}
