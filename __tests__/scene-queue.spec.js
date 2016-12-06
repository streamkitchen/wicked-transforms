
import SceneQueue from "../src/scene-queue";

jest.useFakeTimers();

const scene1x1 = {
  width: 100,
  height: 100,
  regions: [{
    key: "a",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }]
};

const scene1x2 = {
  width: 100,
  height: 100,
  regions: [{
    key: "a",
    x: 0,
    y: 0,
    width: 50,
    height: 100,
  }, {
    key: "b",
    x: 50,
    y: 0,
    width: 50,
    height: 100,
  }]
};

describe("SceneQueue", () => {

  let queue;
  beforeEach(() => {
    queue = new SceneQueue();
  });

  it("should emit the first scene", function(done) {
    queue.on("scene", (scene) => {
      expect(scene).toEqual(scene1x1);
      done();
    });
    queue.pushScene(scene1x1);
  });

  it("should transition gracefully", function(done) {
    let called = 0;
    let expected = [
      scene1x1,
      {
        width: 100,
        height: 100,
        regions: [{
          key: "a",
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }, {
          key: "b",
          x: 100,
          y: 0,
          width: 0,
          height: 100
        }]
      }, {
        width: 100,
        height: 100,
        regions: [{
          key: "a",
          x: 0,
          y: 0,
          width: 50,
          height: 100
        }, {
          key: "b",
          x: 50,
          y: 0,
          width: 50,
          height: 100
        }]
      },
      scene1x2
    ];
    let actual = [];
    queue.on("scene", (scene) => {
      actual.push(scene);
      if (actual.length === 4) {
        expect(actual).toEqual(expected);
        done();
      }
    });
    queue.pushScene(scene1x1);
    queue.pushScene(scene1x2);
    jest.runAllTimers();
  });
});
