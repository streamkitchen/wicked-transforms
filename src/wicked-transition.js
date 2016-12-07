
import WickedScene from "./wicked-scene";
import {scene1x1, scene1x2, scene1x3, scene2x2} from "./default-scenes";
import {ANIM_DURATION} from "./constants";
import debug from "debug";

const log = debug("sk:wicked-transition");

const transitions = {};

export default class WickedTransition {
  constructor({name, before, after, startAnim, endAnim, isReversed}) {
    this.name = name;
    this.before = new WickedScene(before);
    this.after = new WickedScene(after);
    this.isReversed = isReversed;
    this.startAnim = startAnim;
    this.endAnim = endAnim;
  }

  /**
   * To be honest, I don't really know what a scalar is. But this normalizes them anyway.
   */
  _normalizeScalar(scalar, from, to) {
    return (scalar / from) * to;
  }

  _normalizeScene(scene) {
    return {
      ...scene,
      width: 1,
      height: 1,
      regions: scene.regions.map((r) => {
        return {
          ...r,
          width: r.width / scene.width,
          height: r.height / scene.height,
          x: r.x / scene.width,
          y: r.y / scene.height,
        };
      })
    };
  }

  getAfter(fromScene, toScene) {
    const diff = this.after.regions.length - this.before.regions.length;
    let newRegions;
    if (diff === 0) {
      throw new Error("wtf, this isn't a transition, it has the same number before and after");
    }
    else if (diff > 0) {
      return toScene;
    }
    else if (diff < 0) {
      const after = this._normalizeScene(this.after);
      fromScene = this._normalizeScene(fromScene);
      return {
        ...fromScene,
        regions: fromScene.regions.slice(0, this.after.regions.length).map((r, i) => {
          return {
            ...fromScene.regions[i],
            ...after.regions[i],
          }
        }),
      };
    }
  }

  go(fromScene, toScene) {
    if (this.isReversed) {
      const newFromScene = toScene;
      const newToScene = fromScene;
      fromScene = newFromScene;
      toScene = newToScene;
    }
    fromScene = this._normalizeScene(fromScene);
    toScene = this._normalizeScene(toScene);
    const {width, height} = toScene;
    const fromKeys = fromScene.regions.map(r => r.key);
    const toKeys = toScene.regions.map(r => r.key);
    const newRegions = toKeys
      .filter(k => !fromKeys.includes(k))
      .map(k => toScene.regions.find(r => r.key === k));
    const removedRegions = fromKeys
      .filter(k => !toKeys.includes(k))
      .map(k => fromScene.regions.find(r => r.key === k));
    if (newRegions.length === 0) {
      throw new Error("no new regions provided");
    }
    let onTop = true;
    let onBottom = true;
    let onLeft = true;
    let onRight = true;
    newRegions.forEach((r) => {
      onTop = r.y === 0 ? onTop : false;
      onLeft = r.x === 0 ? onLeft : false;
      onBottom = r.height + r.y === height ? onBottom : false;
      onRight = r.width + r.x === width ? onRight : false;
    });
    let comesFrom;
    if (!(onTop || onBottom || onLeft || onRight)) {
      throw new Error("can't transition, you're not on a side!");
    }
    else if (onTop && onBottom || (!onTop && !onBottom)) {
      if (onLeft) {
        comesFrom = "left";
      }
      else if (onRight) {
        comesFrom = "right";
      }
      else {
        comesFrom = "middle";
      }
    }
    else if (onLeft && onRight || (!onLeft && !onRight)) {
      if (onTop) {
        comesFrom = "top";
      }
      else if (onRight) {
        comesFrom = "right";
      }
      else {
        comesFrom = "middle";
      }
    }
    else {
      // Okay, comes from nowhere -- just be there already.
      comesFrom = "middle";
    }
    const newScenes = newRegions.map((r) => {
      r = {...r};
      if (comesFrom === "left") {
        r.x = -r.width;
      }
      else if (comesFrom === "right") {
        r.x = width;
      }
      else if (comesFrom === "top") {
        r.y = -r.height;
      }
      else if (comesFrom === "bottom") {
        r.y = height
      }
      else if (comesFrom === "middle") {
        r.zIndex = 1;
      }
      return r;
    });
    const stubScene = {
      ...fromScene,
      regions: [
        ...fromScene.regions,
        ...newScenes
      ]
    };
    if (!this.isReversed) {
      return [stubScene, toScene, ANIM_DURATION];
    }
    else {
      return [stubScene, ANIM_DURATION, toScene];
    }
  }
}

WickedTransition._transitions = [];

WickedTransition.addTransition = function(transition) {
  WickedTransition._transitions.push(new WickedTransition(transition));
  WickedTransition._transitions.push(new WickedTransition({
    name: `${transition.name} (reversed)`,
    before: transition.after,
    after: transition.before,
    isReversed: true,
  }));
};

WickedTransition.addTransition({
  name: "1x1 --> 1x2",
  before: scene1x1,
  after: scene1x2,
});

WickedTransition.addTransition({
  name: "1x2 --> 2x2",
  before: scene1x2,
  after: scene2x2,
});

WickedTransition.addTransition({
  name: "1x2 --> 1x3",
  before: scene1x2,
  after: scene1x3,
});

WickedTransition.findPath = function(start, end) {
  start = new WickedScene(start);
  end = new WickedScene(end);
  return WickedTransition._findPath(start, end, []);
};

WickedTransition._findPath = function(start, end, path) {
  // omfg do i remember how to do a BFS search algorithm???
  if (start === end) {
    // err yeah base case okay, we're done
    return path;
  }
  // umm... it works... but I think it's exhaustive or something...
  return WickedTransition._transitions
  .filter((transition) => {
    if (transition.before !== start) {
      return false;
    }
    if (path.includes(transition)) {
      return false;
    }
    return true;
  })
  .map((transition) => {
    return this._findPath(transition.after, end, [...path, transition]);
  })
  .reduce((a, b) => {
    if (a && b) {
      return a.length < b.length ? a : b;
    }
    return a || b;
  }, null);
};
