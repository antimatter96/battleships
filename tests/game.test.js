const Game = require("../src/game");

let p1 = "p1";
let p2 = "p2";

let examples = require("./examples");
let sampleShipPlacement = examples.shipPlacement;
let samplePlayerBoard = examples.playerBoard;
let samplePlayerShip = examples.playerShip;

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

  describe("otherPlayer", () => {
    let game = new Game(p1, p2);
    describe("Gives the other player", () => {
      test.each([
        [p1, p2],
        [p2, p1],
      ])("Testing table #%#", (player, result) => {
        expect(game.otherPlayer(player)).toEqual(result);
      });
    });

  });

  describe("startGame", () => {
    let game = new Game(p1, p2);
    describe("Sets the turn of the player", () => {
      test.each([
        [p1, p1],
        [p2, p2],
      ])("Testing table #%#", (player, result) => {
        game.startGame(player);
        expect(game.turnOf).toEqual(result);
      });
    });

  });

  describe("playerReady", () => {
    let game;
    beforeEach(() => {
      game = new Game(p1, p2);
      game.startGame = jest.fn();
      game.bothReady = jest.fn().mockImplementation(() => {return false;});
    });

    test("Given: p1, p1 done", () => {
      game.p1BoardDone.bool = true;
      let result = game.playerReady(p1, sampleShipPlacement);

      expect(result.otherPlayer).toBeUndefined();
      expect(result.thisPlayer).not.toBeUndefined();
      expect(result.thisPlayer[0]).not.toBeUndefined();
      expect(result.thisPlayer[0]).toEqual({ message: 'wait', data: { status: 'Error', msg: 'Already Choosen' } });
      expect(result.thisPlayer[1]).toBeUndefined();
    });

    test("Given: p1, p2 not done", () => {
      let result = game.playerReady(p1, sampleShipPlacement);

      expect(game.p1BoardDone.bool).toEqual(true);

      expect(result.otherPlayer).toBeUndefined();
      expect(result.thisPlayer).not.toBeUndefined();
      expect(result.thisPlayer[0]).not.toBeUndefined();
      expect(result.thisPlayer[0]).toEqual({ message: 'wait', data: { status: 'OK', msg: 'Done' } });
      expect(result.thisPlayer[1]).toBeUndefined();
      expect(game.startGame).not.toBeCalled();
    });

    test("Given: p1, p2 done", () => {
      game.bothReady = jest.fn().mockImplementation(() => {return true;});

      let result = game.playerReady(p1, sampleShipPlacement);

      expect(result.otherPlayer).not.toBeUndefined();
      expect(result.thisPlayer).not.toBeUndefined();
      expect(result.thisPlayer[0]).not.toBeUndefined();
      expect(result.thisPlayer[0]).toEqual({ message: 'wait', data: { status: 'OK', msg: 'Done' } });

      expect(result.otherPlayer[0]).not.toBeUndefined();
      expect(result.otherPlayer[0]).toEqual({ message: 'go', data: { start: false, status: 'OK' } });

      expect(result.thisPlayer[1]).not.toBeUndefined();
      expect(result.thisPlayer[1]).toEqual({ message: 'go', data: { start: true, status: 'OK' } });

      expect(result.otherPlayer[1]).toBeUndefined();

      expect(game.startGame).toBeCalledWith(p1);
    });

    test("Given: p1, value checks", () => {
      let _result = game.playerReady(p1, sampleShipPlacement);

      expect(game.p1Board).toEqual(samplePlayerBoard);
      expect(game.p1Ship).toEqual(samplePlayerShip);
    });

    test("Given: p2, when p2 given", () => {
      let _result = game.playerReady(p2, sampleShipPlacement);

      expect(game.p2Board).toEqual(samplePlayerBoard);
      expect(game.p2Ship).toEqual(samplePlayerShip);
      expect(game.p2BoardDone.bool).toEqual(true);
    });

  });

});