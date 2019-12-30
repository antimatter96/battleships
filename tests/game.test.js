const Game = require("../src/game");

describe("game.js", () => {
  describe("constructor", () => {
    test("", () => {
      expect(function() {
        let a = new Game();
      }).toThrow();
    });
  
    test("", () => {
      expect(function() {
        let a = new Game("a", "v");
      }).not.toThrow();
    });
  });
  
  
});