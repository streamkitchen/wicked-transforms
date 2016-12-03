/**
 * In their own file because verbose
 */

export default function(wicked) {
  // Boring, if we're going to one person they should just appear
  wicked.addTransition({
    name: "0 --> 1",
    start: [],
    startAnim: [{
      key: 0,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    }],
    end: [{
      key: 0,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    }],
    defaultSpeed: "0",
  });

  // 1 --> 2 split-screen
  wicked.addTransition({
    name: "1 --> 1x2",
    start: [{
      key: 0,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    }],
    startAnim: [{
      key: 0,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    }, {
      key: 1,
      x: 100,
      y: 0,
      width: 50,
      height: 100,
    }],
    end: [{
      key: 0,
      x: 0,
      y: 0,
      width: 50,
      height: 100,
    }, {
      key: 1,
      x: 50,
      y: 0,
      width: 50,
      height: 100,
    }],
  });
}