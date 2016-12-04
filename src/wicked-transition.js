
import WickedScene from "./wicked-scene";
import {state1x1, state1x2, state2x1} from "./default-states";

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
    return [
      fromScene,
      300,
      toScene,
      toScene,
    ];
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
  before: state1x1,
  after: state1x2,
  startAnim: function(scene) {

  },
});
WickedTransition.addTransition({
  name: "1x1 --> 2x1",
  before: state1x1,
  after: state2x1,
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
