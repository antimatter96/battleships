const Game = require("../src/game");

let p1 = "p1";
let p2 = "p2";

describe("game.js", () => {
  describe("constructor", () => {

    describe("Fails when user names missing or not strings", () => {

      test("Both missing", () => {
        expect(function() {
          new Game();
        }).toThrow();
      });

      test("Player 2 missing", () => {
        expect(function() {
          new Game("p1");
        }).toThrow();
      });

      test.each([
        ["", ""],
        ["p1", null],
        ["p1", undefined],
        ["p1", ""],
        ["p1", {"name": "p2"}],
        [true, "p2"],
        [false, "p2"],
      ])("Testing table #%#", (p1, p2) => {
        expect(function() {
          new Game(p1, p2);
        }).toThrow();
      });

    });

    test("Works when both player name given and string", () => {
      expect(function() {
        new Game("p1", "p2");
      }).not.toThrow();
    });

    describe("Creates defaults and stuff", () => {
      let game = new Game(p1, p2);
      let regexUUID = new RegExp(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);

      test("Sets a game id", () => {
        expect(game.id).toMatch(regexUUID);
      });

      test("Sets names of players", () => {
        expect(game.p1).toEqual(p1);
        expect(game.p2).toEqual(p2);
      });

      test("Sets players board done to false", () => {
        expect(game.p1BoardDone).toEqual({bool: false});
      });

      test("Set turns to the first player", () => {
        expect(game.turnOf).toEqual(p1);
      });

      test("Creates the ship's data structures", () => {
        expect(game.p1Ship).toEqual({
          "A": expect.any(Set),
          "B": expect.any(Set),
          "C": expect.any(Set),
          "D": expect.any(Set),
          "E": expect.any(Set)
        });
        expect(game.p1Ship).toEqual(game.p2Ship);
      });

      test("Creates the boards", () => {
        let row = (new Array(10)).fill(0);
        let board = (new Array(10)).fill(row);

        expect(game.p1Board).toEqual(board);
        expect(game.p2Board).toEqual(board);
      });
    });

  });

  describe("bothReady", () => {
    let game = new Game(p1, p2);
    describe("ANDS the done of both players", () => {
      test.each([
        [true, true, true],
        [true, false, false],
        [false, true, false],
        [false, false, false],
      ])("Testing table #%#", (p1BoardDone, p2BoardDone, result) => {
        game.p1BoardDone.bool = p1BoardDone;
        game.p2BoardDone.bool = p2BoardDone;
        expect(game.bothReady()).toEqual(result);
      });
    });

  });

});