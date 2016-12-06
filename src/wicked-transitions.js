/**
 * Wicked transitions are a way of defining transitions given various rectangular regions on a
 * canvas. Like, you know, what streamplace is.
 */

import defaultTransitions from "./default-transitions";
import debug from "debug";

const log = debug("sk:wicked-transitions");

const TRANSITION_DURATION = 300;

export class StateQueue {
  constructor({from, to, transitions, delay}) {
    this.regionsById = {};
    from.concat(to).forEach((region) => {
      this.regionsById[region.id] = region;
    });
    const [transition] = transitions;
    this.states = [
      transition.start,
      transition.startAnim,
      delay,
      transition.endAnim,
      transition.end,
    ];
  }

  getNext() {
    if (this.states.length === 0) {
      log("No more states, returning null.");
      return null;
    }
    return new Promise((resolve, reject) => {
      let state = this.states.shift();
      if (typeof state === "number") {
        setTimeout(() => {
          this.getNext().then(resolve).catch(reject);
        }, state);
      }
      else {
        state = state.map((region) => {
          return {...this.regionsById[region.id], ...region};
        });
        resolve(state);
      }
    });
  }
}

export class WickedTransitions {
  constructor() {
    this.transitions = [];
  }

  /**
   * Add a new transition!
   * @param {[type]} transition [description]
   */
  addTransition(transition) {
    const {start, startAnim, endAnim, end} = transition;
    if (!start || !end) {
      throw new Error("Missing start and end of transition!");
    }
    if (startAnim === undefined) {
      transition.startAnim = start;
    }
    if (endAnim === undefined) {
      transition.endAnim = end;
    }
    // Each transition gets a transition and a reversed version of itself
    this.transitions.push(transition);
    const reversed = {
      name: `${transition.name} (reversed)`,
      start: transition.end,
      startAnim: transition.endAnim,
      endAnim: transition.startAnim,
      end: transition.start,
    };
    this.transitions.push(reversed);
  }

  regionMatches(r1, r2) {
    return ["x", "y", "width", "height"].every((field) => {
      if (r1[field] === r2[field]) {
        return true;
      }
      // Only other case: they're fraction tuples
      if (!(typeof r1[field].length === "number" && typeof r2[field].length === "number")) {
        log(`typeof ${field}.length: ${typeof r1[field].length} !== ${typeof r2[field].length}`);
        return false;
      }
      // Okay, check that then
      const [r1Num, r1Dom] = r1[field];
      const [r2Num, r2Dom] = r2[field];
      if (r1Num !== r2Num || r2Num !== r2Dom) {
        log(`fraction: ${r1Num}/${r2Dom} !== ${r2Num}/${r2Dom}`);
        return false;
      }
      return true;
    });
  }

  regionsMatch(regions1, regions2) {
    if (regions1.length !== regions2.length) {
      log(`Length mismatch: ${regions1.length} !== ${regions2.length}`);
      return false;
    }
    return regions1.every((r1, i) => {
      return this.regionMatches(r1, regions2[i]);
    });
  }

  transitionMatches(transition, from, to) {
    const {start, end} = transition;
    if (!this.regionsMatch(start, from) || !this.regionsMatch(to, end)) {
      return false;
    }
    const logger = [];
    from.forEach((region, i) => {
      lo
    });
    log(keyToId);
    return true;
  }

  transition(from, to) {
    const transition = this.transitions.find((transition) => {
      log(`Checking ${transition.name}`);
      return this.transitionMatches(transition, from, to);
    });
    const allRegions = {};
    log(transition ? transition.name : "No transition found");
    return new StateQueue({from, to, transitions: [transition], duration: TRANSITION_DURATION});
  }

  /**
   * Convert from our weird array fraction syntax to proper american floats
   */
   normalizeRegion (region) {
    const ret = {};
    ["x", "y", "width", "height"].forEach((name) => {
      const param = region[name];
      if (typeof param.length === "number") {
        if (param.length !== 2) {
          throw new Error("Invalid state, array syntax is a fraction, should have two params");
        }
        const [numerator, denominator] = param;
        ret[name] = numerator / denominator;
      }
      else {
        ret[name] = region[name];
      }
    });
    return ret;
  };

  /**
   * Given a region, yield an object with {top, left, width, height} strings
   */
  getStateCss(state) {
    // state = this.normalizeRegion(state);
    return {
      left: `${state.x}%`,
      top: `${state.y}%`,
      width: `${state.width}%`,
      height: `${state.height}%`,
    };
  }
}

const wicked = new WickedTransitions();
defaultTransitions(wicked);

export default wicked;
