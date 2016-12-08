
import WickedScene from "./wicked-scene";
import {
  scene1x1,
  scene1x2,
  scene1x3,
  scene2x2,
  scene1x2x2,
  scene0x0,
  scene2x2x2
} from "./default-scenes";
import {ANIM_DURATION} from "./constants";
import debug from "debug";
import {combination} from "js-combinatorics";

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

  /**
   * Return a normalized scene with all of its coordinates using the same system. We maintain them
   * as integers so comparison should be fine.
   */
  _normalizeScene(scene) {
    return WickedScene.prototype._normalizeScene(scene);
  }

  getAfter(currentScene, endScene, startScene) {
    const diff = this.after.regions.length - this.before.regions.length;
    if (diff === 0) {
      throw new Error("wtf, this isn't a transition, it has the same number before and after");
    }
    const after = this._normalizeScene(this.after);
    const currentKeys = currentScene.regions.map(r => r.key);
    const endKeys = endScene.regions.map(r => r.key);
    currentScene = this._normalizeScene(currentScene);
    let candidateScenes = [];
    if (diff > 0) {
      // Okay, we gots to add some. Who should we add?
      // Are there any regions at the end state that aren't currently here? Try them!
      let additions = this._normalizeScene(endScene).regions.filter((r) => {
        return !currentKeys.includes(r.key);
      });
      if (additions.length === 0) {
        // alas, i cannot aid ye
        return [];
        // throw new Error("okay now we need to figure out this other case");
      }
      let combinations;
      if (additions.length > diff) {
        combinations = combination(additions, diff);
      }
      else {
        combinations = [additions];
      }
      combinations.forEach((comb) => {
        candidateScenes.push({
          ...currentScene,
          regions: currentScene.regions.concat(comb).map((r, i) => {
            return {
              ...r,
              ...after.regions[i]
            };
          }),
        });
      })
    }
    else if (diff < 0) {
      const combinations = combination(currentScene.regions, this.after.regions.length);
      combinations.forEach((comb) => {
        candidateScenes.push({
          ...currentScene,
          regions: comb.map((r, i) => {
            return {
              ...r,
              ...after.regions[i],
            }
          }),
        });
      });
    }
    // Only submit candidates that move horizontally or vertically, not both
    return candidateScenes.filter((scene) => {
      let movesVertical = false;
      let movesHorizontal = false;
      scene.regions.forEach((newRegion, i) => {
        const currentRegion = currentScene.regions.find(r => r.key === newRegion.key);
        if (!currentRegion) {
          return;
        }
        if (currentRegion.x !== newRegion.x || currentRegion.width !== newRegion.width) {
          movesHorizontal = true;
        }
        if (currentRegion.y !== newRegion.y || currentRegion.height !== newRegion.height) {
          movesVertical = true;
        }
      })
      return !(movesHorizontal && movesVertical);
    });
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
      console.log(this.name);
      console.log(fromScene, toScene);
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
      comesFrom = "middle";
    }
    else if (onTop && onBottom && onLeft && onRight) {
      comesFrom = "middle";
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
  name: "2x2 --> 1x2x2",
  before: scene2x2,
  after: scene1x2x2,
});

WickedTransition.addTransition({
  name: "1x2x2 --> 2x2x2",
  before: scene1x2x2,
  after: scene2x2x2,
});

WickedTransition.addTransition({
  name: "1x3 --> 1x2x2",
  before: scene1x3,
  after: scene1x2x2,
});

WickedTransition.addTransition({
  name: "1x3 --> 2x2x2",
  before: scene1x3,
  after: scene2x2x2,
});

WickedTransition.addTransition({
  name: "1x2 --> 1x3",
  before: scene1x2,
  after: scene1x3,
});

WickedTransition.addTransition({
  name: "0x0 --> 1x1",
  before: scene0x0,
  after: scene1x1,
});

WickedTransition.findPath = function(current, end, start = current, transitions = [], scenePath = []) {
  // log(transitions.map(t => t.name).join(" | "));
  const wCurrent = new WickedScene(current);
  // omfg do i remember how to do a BFS search algorithm???
  if (wCurrent.isEqual(end)) {
    // err yeah base case okay, check to see if it's the right keys
    const same = current.regions.every((r, i) => {
      return r.key === end.regions[i].key;
    });
    if (same) {
      return {transitions, scenePath};
    }
    // console.info("Rejected for reasons of key mismatch");
  }
  // umm... it works... but I think it's exhaustive or something...
  return WickedTransition._transitions
  .filter((transition) => {
    if (new WickedScene(transition.before) !== new WickedScene(current)) {
      return false;
    }
    if (transitions.includes(transition)) {
      return false;
    }
    return true;
  })
  .map((transition) => {
    const candidateScenes = transition.getAfter(current, end, start);
    return [transition, candidateScenes];
  })
  .reduce((arr, [transition, candidateScenes]) => {
    return arr.concat(candidateScenes.map(s => [transition, s]))
  }, [])
  // That thing returns arrays, flatten them
  .map(([transition, afterScene]) => {
    return this.findPath(afterScene, end, start, [...transitions, transition], [...scenePath, afterScene]);
  })
  .reduce((a, b) => {
    if (a && a.transitions) {
      if (b && b.transitions) {
        return a.transitions.length < b.transitions.length ? a : b;
      }
      return a;
    }
    return b;
  }, {});
};
