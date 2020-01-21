const GameController = require("../src/gameController");
const Game = require("../src/game");

const http = require("http");
const { List } = require('immutable');
const SocketIO = require('socket.io');


describe("gameController.js", () => {
  let server = http.Server();
  beforeEach(() => {
    server = http.Server();
  });
  afterEach(() => {
    server.close();
  });

  describe("constructor", () => {
    test("Fails when server missing", () => {
      expect(function () {
        new GameController();
      }).toThrow();
    });

    test("Works", () => {
      expect(function () {
        new GameController(server);
      }).not.toThrow();
    });

    describe("Creates instance variables and stuff", () => {
      let gameController = new GameController(server);

      test("", () => {
        expect(gameController.io).toBeInstanceOf(SocketIO);
      });

      test("", () => {
        expect(gameController.UsersInQueue).toBeInstanceOf(List);
      });

      test("", () => {
        expect(gameController.Users).toBeInstanceOf(Set);
      });

      test("", () => {
        expect(gameController.socketOfUser).toBeInstanceOf(Array);
      });

      test("", () => {
        expect(gameController.playerIsIn).toBeInstanceOf(Array);
      });

      test("", () => {
        expect(gameController.Games).toBeInstanceOf(Object);
      });



    });

  });

  describe("Start", () => {
    let gameController;
    beforeEach(() => {
      gameController = new GameController(server);
    });

    test("Calls io.connect with start server", () => {
      let spy = jest.spyOn(gameController.io, 'on');
      gameController.Start();
      expect(spy).toBeCalledWith("connect", expect.any(Function));
      expect(spy.mock.calls[0][1].name).toEqual("bound connect");
    });
  });

  describe("rejectIfGameMissing", () => {
    let gameController;
    let socket;
    let callback;

    beforeEach(() => {
      gameController = new GameController(server);
    });

    describe("checks for data", () => {
      let err = new Error("missing data");

      test.each([
        [null],
        [undefined],
        [{}],
        [""],
        [true],
      ])("Testing table #%#", (data) => {
        let returned = gameController.rejectIfGameMissing(callback, socket, data);
        expect(returned).toEqual(err);
      });
    });

    describe("checks for data.player", () => {
      let err = new Error("missing playerId");

      test.each([
        [{ one: "two" }],
      ])("Testing table #%#", (data) => {
        let returned = gameController.rejectIfGameMissing(callback, socket, data);
        expect(returned).toEqual(err);
      });
      test.each([
        [null],
        [undefined],
        [{}],
        [""],
        [true],
      ])("Testing table #%#", (data) => {
        let returned = gameController.rejectIfGameMissing(callback, socket, { player: data });
        expect(returned).toEqual(err);
      });
    });

    describe("checks for gameId for player", () => {
      let playerId = "some_player_id";
      let data = { player: playerId };

      let err = new Error("missing gameId");

      test.each([
        [{}],
      ])("Testing table #%#", (tc) => {
        gameController.playerIsIn = tc;
        let returned = gameController.rejectIfGameMissing(callback, socket, data);
        expect(returned).toEqual(err);
      });
      test.each([
        [null],
        [undefined],
        [{}],
        [""],
        [true],
      ])("Testing table #%#", (tc) => {
        gameController.playerIsIn[playerId] = tc;
        let returned = gameController.rejectIfGameMissing(callback, socket, data);
        expect(returned).toEqual(err);
      });
    });

    describe("checks for game for player", () => {
      let playerId = "some_player_id";
      let gameId = "some_game_id";
      let data = { player: playerId };

      let err = new Error("missing game");

      beforeEach(() => {
        gameController.playerIsIn[playerId] = gameId;
      });

      test.each([
        [{}],
      ])("Testing table #%#", (tc) => {
        gameController.Games = tc;
        let returned = gameController.rejectIfGameMissing(callback, socket, data);
        expect(returned).toEqual(err);
      });
      test.each([
        [null],
        [undefined],
        [{}],
        [""],
        [true],
      ])("Testing table #%#", (tc) => {
        gameController.Games[gameId] = tc;
        let returned = gameController.rejectIfGameMissing(callback, socket, data);
        expect(returned).toEqual(err);
      });
    });

    describe("everything OK", () => {
      let playerId = "some_player_id";
      let gameId = "some_game_id";
      let data = { player: playerId };
      let game = new Game("p1", "p2");

      callback = jest.fn();

      test("calls callback ", () => {
        gameController.playerIsIn[playerId] = gameId;
        gameController.Games[gameId] = game;
        gameController.rejectIfGameMissing(callback, socket, data);
        expect(callback).toBeCalledWith(socket, playerId, game, data);
      });
    });

  });

});