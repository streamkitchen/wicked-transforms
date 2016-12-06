
import WickedScene from "./wicked-scene";
import {scene1x1, scene1x2, scene2x1} from "./default-scenes";

const transitions = {};

export default class WickedTransition {
  constructor({name, before, after, startAnim, endAnim}) {
    this.name = name;
    this.before = new WickedScene(before);
    this.after = new WickedScene(after);
    this.startAnim = startAnim;
    this.endAnim = endAnim;
  }

  go(fromScene, toScene) {
    const fromKeys = fromScene.regions.map(r => r.key);
    const toKeys = toScene.regions.map(r => r.key);
    const newRegions = toKeys
      .filter(k => !fromKeys.includes(k))
      .map(k => toScene.regions.find(r => r.key === k));
    const removedRegions = fromKeys
      .filter(k => !toKeys.includes(k))
      .map(k => fromScene.regions.find(r => r.key === k));
    if (toKeys.length > fromKeys.length) {
      // New regions, cool. How is the transition happening?
      return {
        start: {
          width: fromScene.width,
          height: fromScene.height,
          regions: [
            ...fromScene.regions,
            ...newRegions.map(r => {
              return {...r, x: fromScene.width}
            })
          ]
        },
        end: toScene
      }
    }
    else {
      return {
        start: fromScene,
        end: {
          width: toScene.width,
          height: toScene.height,
          regions: [
            ...toScene.regions,
            ...removedRegions.map(r => {
              // If we were first, slide off to the left
              const idx = fromKeys.indexOf(r.key);
              if (idx === 0) {
                return {...r, x: -r.width}
              }
              // If we were last, slide off to the right
              if (idx === fromKeys.length - 1) {
                return {...r, x: toScene.width}
              }
            }),
          ]
        }
      }
    }
    return {
      start: fromScene,
      end: toScene,
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
    startAnim: transition.endAnim,
    endAnim: transition.startAnim,
  }));
};

WickedTransition.addTransition({
  name: "1x1 --> 1x2",
  before: scene1x1,
  after: scene1x2,
  startAnim: function({toScene, fromKeys, toKeys}) {
    return {
      ...this.before,
      regions: [
        ...this.before.regions
      ]
    }
  },
  endAnim: function({toKeys}) {
    return {
      ...this.after,
      regions: this.after.regions.map((r, i) => {
        return {...r, key: toKeys[i]};
      }),
    };
  }
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
