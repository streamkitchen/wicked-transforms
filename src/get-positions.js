
export default function getPositions({count}) {
  if (count === 0) {
    return [];
  }
  if (count === 1) {
    return [{
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    }];
  }
  if (count === 2) {
    return [{
      x: 0,
      y: 0,
      width: 50,
      height: 100,
    } , {
      x: 50,
      y: 0,
      width: 50,
      height: 100,
    }];
  }
  if (count === 3) {
    return [{
      x: 0,
      y: 0,
      width: [100, 3],
      height: 100,
    }, {
      x: [100, 3],
      y: 0,
      width: [100, 3],
      height: 100,
    }, {
      x: [100 * 2, 3],
      y: 0,
      width: [100, 3],
      height: 100,
    }];
  }
  if (count === 4) {
    return [{
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    }, {
      x: 50,
      y: 0,
      width: 50,
      height: 50,
    }, {
      x: 0,
      y: 50,
      width: 50,
      height: 50,
    }, {
      x: 50,
      y: 50,
      width: 50,
      height: 50,
    }];
  }
};