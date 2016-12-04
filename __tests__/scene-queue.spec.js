
import SceneQueue from "../src/scene-queue";

jest.useFakeTimers();

describe("SceneQueue", () => {

  let queue;
  beforeEach(() => {
    queue = new SceneQueue();
  });

  it("should emit the first scene", function(done) {
    const myScene = {
      width: 100,
      height: 100,
      regions: [{
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        key: 0,
      }]
    };
    queue.on("scene", (scene) => {
      expect(scene).toEqual(myScene);
      done();
    });
    queue.pushScene(myScene);
  });

  it("should transition gracefully", function(done) {
    let called = 0;
    queue.on("scene", (scene) => {
      called += 1;
      if (called > 1 && queue.queue.length === 0) {
        expect(called).toBe(4);
        done();
      }
    });
    queue.pushScene({
      width: 100,
      height: 100,
      regions: [{
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        key: 0,
      }]
    });
    queue.pushScene({
      width: 100,
      height: 100,
      regions: [{
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
      }]
    });
    jest.runAllTimers();
  });
});
