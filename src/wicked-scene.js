
/**
 * A Scene represents a certain arraingement of 2d regions within a box. The Scene constructor
 * takes care of maintaining only one copy of identical scenes, so we can use === to compare if
 * scenes are identical.
 */

const sceneCache = [];

export default class WickedScene {
  /**
   * Make a new scene. Returns a ref to a previous scene if we've seen this exact one before.
   */
  constructor(newScene) {
    // Check to see if we already have you...
    for (let i = 0; i < sceneCache.length; i+=1) {
      if (sceneCache[i].isEqual(newScene)) {
        return sceneCache[i];
      }
    }

    // We don't? Okay. Copy everything into ourself and freeze.
    this.regions = Object.freeze(newScene.regions.map(({x, y, width, height}) => {
      return Object.freeze({x, y, width, height});
    }));
    this.width = newScene.width;
    this.height = newScene.height;
    Object.freeze(this);
    sceneCache.push(this);
  }

  /**
   * Is this scene exactly equal to another scene? If so, yay!
   *
   * TODO improvement: another scene should compare as identical to us if all their fractions
   * reduce the same way and all that.
   */
  isEqual(other) {
    // Maybe they're literally us?
    if (this === other) {
      return true;
    }
    if (this.width !== other.width || this.height !== other.height) {
      return false;
    }
    if (this.regions.length !== other.regions.length) {
      return false;
    }
    return this.regions.every((thisRegion, i) => {
      const otherRegion = other.regions[i];
      return thisRegion.x === otherRegion.x &&
        thisRegion.y === otherRegion.y &&
        thisRegion.width === otherRegion.width &&
        thisRegion.height === otherRegion.height;
    });
  }

  _reduce(num, den) {
    var gcd = function gcd(a,b){
      return b ? gcd(b, a%b) : a;
    };
    gcd = gcd(num,den);
    return [num/gcd, den/gcd];
  }
}

WickedScene._sceneCache = [];
