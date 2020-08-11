const http = require("http");
const fs = require("fs");
const path = require("path");
const { List } = require('immutable');
const SocketIO = require('socket.io');
const r = require("rethinkdb");

const GameController = require("../src/gameController");
const Game = require("../src/game");

jest.mock("rethinkdb");
jest.mock("../src/game");

describe("gameController.js", () => {
  let dbName = "dbName";
  let keys = {
    key: fs.readFileSync(path.join(__dirname, "../private.pem.sample")),
    publicKey: fs.readFileSync(path.join(__dirname, "../public.pem.sample")),
  };

  let server = http.Server();
  beforeEach(() => {
    server = http.Server();
  });
  afterEach(() => {
    server.close();
  });

  describe.skip("constructor", () => {

    describe("server missing", () => {
      test("Fails", () => {
        expect(function () {
          new GameController();
        }).toThrow();
      });
    });

    describe("keys missing", () => {
      test("Fails", () => {
        expect(function () {
          new GameController(server);
        }).toThrow();
      });
    });

    describe("server and keys present", () => {
      test("Works", () => {
        expect(function () {
          new GameController(server, keys);
        }).not.toThrow();
      });
    });

    describe("Creates instance variables and stuff", () => {
      r.connect.mockClear();
      let gameController = new GameController(server, keys);

      test("SocketIO", () => {
        expect(gameController.io).toBeInstanceOf(SocketIO);
      });

      test("List", () => {
        expect(gameController.UsersInQueue).toBeInstanceOf(List);
      });

      test("Users Set", () => {
        expect(gameController.Users).toBeInstanceOf(Set);
      });

      test("Socket user mapping", () => {
        expect(gameController.socketOfUser).toBeInstanceOf(Array);
      });

      test("Player game mapping", () => {
        expect(gameController.playerIsIn).toBeInstanceOf(Object);
      });

      test("Calls database", () => {
        expect(r.connect).toBeCalledWith("");
      });

    });

  });

  describe.skip("Start", () => {
    let gameController;
    beforeEach(() => {
      gameController = new GameController(server, keys);
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
      gameController = new GameController(server, keys);
    });

    describe.skip("checks for data", () => {
      let err = new Error("missing data");

      test.each([
        [null],
        [undefined],
        [{}],
        [""],
        [true],
      ])("Testing table #%#", async (data) => {
        let returned = await gameController.rejectIfGameMissing(callback, socket, data);
        expect(returned).toEqual(err);
      });
    });

    describe.skip("checks for data.player", () => {
      let err = new Error("missing playerId");

      test.each([
        [{ one: "two" }],
      ])("Testing table #%#", async (data) => {
        let returned = await gameController.rejectIfGameMissing(callback, socket, data);
        expect(returned).toEqual(err);
      });

      test.each([
        [null],
        [undefined],
        [{}],
        [""],
        [true],
      ])("Testing table #%#", async (data) => {
        let returned = await gameController.rejectIfGameMissing(callback, socket, { player: data });
        expect(returned).toEqual(err);
      });
    });

    describe.skip("checks for gameId for player", () => {
      let playerId = "some_player_id";
      let data = { player: playerId };

      let err = new Error("missing gameId");

      test.each([
        [{}],
      ])("Testing table #%#", async (tc) => {
        gameController.playerIsIn = tc;
        let returned = await gameController.rejectIfGameMissing(callback, socket, data);
        expect(returned).toEqual(err);
      });

      test.each([
        [null],
        [undefined],
        [{}],
        [""],
        [true],
      ])("Testing table #%#", async (tc) => {
        gameController.playerIsIn[playerId] = tc;
        let returned = await gameController.rejectIfGameMissing(callback, socket, data);
        expect(returned).toEqual(err);
      });
    });

    describe("checks for game for player", () => {
      let playerId = "some_player_id";
      let gameId = "some_game_id";
      let data = { player: playerId };

      beforeEach(() => {
        gameController.playerIsIn[playerId] = gameId;
      });

      describe("throws error on db errors", () => {

        let err = new Error("db error");

        test.each([
          [null],
          [undefined],
        ])("Testing table #%#", async (tc) => {
          //gameController.Games[gameId] = tc;
          let returned = await gameController.rejectIfGameMissing(callback, socket, data);
          expect(returned).toEqual(err);
        });

        test(">>", async () => {
          r.table = () => {
            return { 
              filter: (data) => {
                console.log(data);
                return { run: (db) => { return jest.fn().mockResolvedValue(r.Cursor); } };
              }
            };
          };
          let returned = await gameController.rejectIfGameMissing(callback, socket, data);
          expect(returned).toEqual(err);
        });
      });


    });

    describe.skip("everything OK", () => {
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

  describe.skip("sendStuff", () => {
    let gameController;
    let currentPlayerSocket = {};
    currentPlayerSocket.emit = jest.fn();
    let otherPlayerSocket = {};
    otherPlayerSocket.emit = jest.fn();
    let thisPlayerMessages = [];
    let response = {
      thisPlayer: thisPlayerMessages,
    };

    let otherPlayer = "otherPlayer";

    gameController = new GameController(server, keys);
    gameController.socketOfUser[otherPlayer] = otherPlayerSocket;

    describe("checks for data", () => {
      test("", () => {
        let message = {
          data: { status: "some_data", otherThings: { otherThings: "other_things" } },
          message: "some_message"
        };
        thisPlayerMessages.push(message);
        gameController.sendStuff(currentPlayerSocket, otherPlayer, response);
        expect(currentPlayerSocket.emit).toBeCalledWith(message.message, message.data);
      });
    });

    describe("checks for data", () => {
      test("", () => {
        let message = {
          data: { status: "some_data", otherThings: { otherThings: "other_things" } },
          message: "some_message"
        };
        thisPlayerMessages.push(message);
        gameController.sendStuff(currentPlayerSocket, otherPlayer, response);
        expect(currentPlayerSocket.emit.mock.calls.length).toEqual(2);
      });
    });

    describe("checks for data.player", () => {
      test("", () => {
        currentPlayerSocket.to = jest.fn().mockImplementation((otherSocket) => {
          expect(otherSocket).toBe(otherPlayerSocket);
          return otherPlayerSocket;
        });
        let message = {
          data: { status: "some_data", otherThings: { otherThings: "other_things" } },
          message: "some_message"
        };
        response.otherPlayer = [message];
        thisPlayerMessages.push(message);
        gameController.sendStuff(currentPlayerSocket, otherPlayer, response);
        expect(currentPlayerSocket.emit).toBeCalledWith(message.message, message.data);
        expect(currentPlayerSocket.to).toBeCalledWith(otherPlayerSocket);
        expect(otherPlayerSocket.emit).toBeCalledWith(message.message, message.data);
      });
    });

    describe("checks for gameId for player", () => {

    });

    describe("checks for game for player", () => {

    });

    describe("everything OK", () => {

    });

  });

});
