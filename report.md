# Realtime Battleships game using Websockets

<br>
<br>

**Implementing the classic BattleShips game using Socket.Io and Node.js**

<br>
<br>
<br>

**By**
**Arpit Jain**
**716/IT/14**

=============

[TOC]

=============

## Websockets

### What was wrong with HTTP ?
The web has been largely built around the so-called request/response paradigm of HTTP. A client loads up a web page and then nothing happens until the user clicks onto the next page. Around 2005, AJAX (Asynchronous JavaScript And XML) started to make the web feel more dynamic. Still, all HTTP communication was steered by the client, which required user interaction or periodic polling to load new data from the server.

Technologies that enable the server to send data to the client in the very moment when it knows that new data is available have been around for quite some time. They go by names such as "Push" or "Comet". One of the most common hacks to create the illusion of a server initiated connection is called long polling. With long polling, the client opens an HTTP connection to the server which keeps it open until sending response. Whenever the server actually has new data it sends the response. Long polling and the other techniques work quite well, however, all of these work-arounds share one problem: They carry the overhead of HTTP, which doesn't make them well suited for low latency applications.

### WebSockets

WebSocket is a communications protocol, providing full-duplex communication channels over a single TCP connection. 
In plain words: There is a persistent connection between the client and the server and both parties can start sending data at any time.

The WebSocket protocol enables interaction between a browser and a web server with lower overheads, facilitating real-time data transfer from and to the server. This is made possible by providing a standardized way for the server to send content to the browser without being solicited by the client, and allowing for messages to be passed back and forth while keeping the connection open.

The WebSocket protocol was standardized by the IETF (Internet Engineering Task Force) as RFC 6455 in 2011, and the WebSocket API in Web IDL is being standardized by the W3C (World Wide Web Consortium).

### Working

The WebSocket protocol was designed to work well with the existing Web infrastructure. As part of this design principle, the protocol specification defines that the WebSocket connection starts its life as an HTTP connection, guaranteeing full backwards compatibility with the pre-WebSocket world. The protocol switch from HTTP to WebSocket is referred to as a the WebSocket handshake.

The browser sends a request to the server, indicating that it wants to switch protocols from HTTP to WebSocket. The client expresses its desire through the Upgrade header

```
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
Origin: http://example.com
```

If the server understands the WebSocket protocol, it agrees to the protocol switch through the Upgrade header.

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
Sec-WebSocket-Protocol: chat
```

At this point the HTTP connection breaks down and is replaced by the WebSocket connection over the same underlying TCP/IP connection. The WebSocket connection uses the same ports as HTTP (80) and HTTPS (443), by default.

The handshake resembles HTTP in allowing servers to handle HTTP connections as well as WebSocket connections on the same port. Once the connection is established, communication switches to a bidirectional binary protocol which doesn't conform to the HTTP protocol.

In addition to Upgrade headers, the client sends a Sec-WebSocket-Key header containing base64-encoded random bytes, and the server replies with a hash of the key in the Sec-WebSocket-Accept header. This is intended to prevent a caching proxy from re-sending a previous WebSocket conversation, and does not provide any authentication, privacy or integrity. The hashing function appends the fixed string `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` (a UUID) to the value from Sec-WebSocket-Key header (which is not decoded from base64), applies the SHA-1 hashing function, and encodes the result using base64.

Once the connection is established, the client and server can send WebSocket data or text frames back and forth in full-duplex mode. The data is minimally framed, with a small header followed by payload. WebSocket transmissions are described as "messages", where a single message can optionally be split across several data frames. This can allow for sending of messages where initial data is available but the complete length of the message is unknown (it sends one data frame after another until the end is reached and marked with the FIN bit). With extensions to the protocol, this can also be used for multiplexing several streams simultaneously (for instance to avoid monopolizing use of a socket for a single large payload).

The WebSocket protocol specification defines `ws` and `wss` as two new uniform resource identifier (URI) schemes that are used for unencrypted and encrypted connections, respectively. Apart from the scheme name and fragment (`#` is not supported), the rest of the URI components are defined to use URI generic syntax.

<br><br>

## Node.js

Node.js is an open-source, cross-platform JavaScript run-time environment for executing JavaScript code server-side. JavaScript was historically used primarily for client-side scripting, in which scripts written in JavaScript are embedded in a webpage's HTML, to be run client-side by a JavaScript engine in the user's web browser, Node.js enables JavaScript to be used for server-side scripting, and runs scripts server-side to produce dynamic web page content.

Node.js allows the creation of Web servers and networking tools using JavaScript and a collection of "modules" that handle various core functionality. Modules are provided for file system I/O, networking (DNS, HTTP, TCP, TLS/SSL, or UDP), binary data (buffers), cryptography functions, data streams and other core functions.

Node.js is primarily used to build network programs such as Web servers. The biggest difference between Node.js and other languages is that most functions in others block until completion (commands execute only after previous commands have completed), while functions in Node.js are designed to be non-blocking (commands execute in parallel, and use callbacks to signal completion or failure).
Node.js was created because concurrency is difficult in many server-side programming languages, and often leads to poor performance.

Node.js is built on the Google V8 JavaScript engine.
V8 is the JavaScript execution engine built for Google Chrome and open-sourced by Google in 2008. Written in C++, V8 compiles JavaScript source code to native machine code instead of interpreting it in real time.

Node.js uses libuv to handle asynchronous events. Libuv is an abstraction layer for network and file system functionality on both Windows and POSIX-based systems like Linux, macOS and Unix.

The core functionality of Node.js resides in a JavaScript library. The Node.js bindings, written in C++, connect these technologies to each other and to the operating system.

### Threading

Node.js operates on a single thread, using non-blocking I/O calls, allowing it to support tens of thousands of concurrent connections without incurring the cost of thread context switching. The design of sharing a single thread between all the requests that uses the observer pattern is intended for building highly concurrent applications, where any function performing I/O must use a callback. In order to accommodate the single-threaded event loop, Node.js utilizes the libuv library that in turn uses a fixed-sized threadpool that is responsible for some of the non-blocking asynchronous I/O operations.

Execution of parallel tasks in Node.js is handled by a thread pool. The main thread call functions post tasks to the shared task queue that threads in the thread pool pull and execute. Inherently non-blocking system functions like networking translates to kernel-side non-blocking sockets, while inherently blocking system functions like file I/O run in a blocking way on its own thread. When a thread in the thread pool completes a task, it informs the main thread of this that in turn wakes up and execute the registered callback. Since callbacks are handled in serial on the main thread, long lasting computations and other CPU-bound tasks will freeze the entire event-loop until completion.

### Event loop

Node.js registers itself with the operating system in order to be notified when a connection is made, and the operating system will issue a callback. Within the Node.js runtime, each connection is a small heap allocation. Traditionally, relatively heavyweight OS processes or threads handled each connection. Node.js uses an event loop for scalability, instead of processes or threads. In contrast to other event-driven servers, Node.js's event loop does not need to be called explicitly. Instead callbacks are defined, and the server automatically enters the event loop at the end of the callback definition. Node.js exits the event loop when there are no further callbacks to be performed.

### Expressjs

Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
Express provides a thin layer of fundamental web application features, without obscuring Node.js features that you know and love.

### Socket.io
Socket.IO is a JavaScript library for realtime web applications. It enables realtime, bi-directional communication between web clients and servers. It has two parts: a client-side library that runs in the browser, and a server-side library for Node.js. Both components have a nearly identical API. Like Node.js, it is event-driven.

Socket.IO primarily uses the WebSocket protocol with polling as a fallback option, while providing the same interface. Although it can be used as simply a wrapper for WebSocket, it provides many more features, including broadcasting to multiple sockets, storing data associated with each client, and asynchronous I/O.

## Event driven programming using Socket.io

We can choose the actions to be done on a particular event, using any data sent by the client

```js
socket.on('eventName', function (data) {
	...
	...		
});
```

We can send data to the client who triggered the event easily

```js
socket.on('eventName', function (data) {
	...
	socket.emit('myOtherEvent', otherData);	
});
```

We can send data to a client using its socketId which can be accessed by its `id`;

```js
let socketId = socket.id;
...
...
socket.to( socketId ).emit('eventName', data);
```

The same is valid for client side except that the client can emit only to the server

## Rules

**Game Objective**

The object of Battleship is to try and sink all of the other player's before they sink all of your ships. All of the other player's ships are somewhere on his/her board.  Neither you nor the other player can see the other's board so you must try to guess where they are.  Each board has two grids one for the player's ships and the other for recording the player's guesses and their results.
<br>

**Starting a New Game**

Each player places the 5 ships somewhere on their board.  The ships can only be placed vertically or horizontally. Diagonal placement is not allowed. No part of a ship may hang off the edge of the board.  Ships may not overlap each other.  No ships may be placed on another ship. 

Once the guessing begins, the players may not move the ships.

The 5 ships are:  Carrier (occupies 5 spaces), Submarine (4), Destroyer (3), Cruiser (2), and Patrol (2).  
<br>

**Playing the Game**

Player's take turns guessing by calling out the coordinates. The opponent responds with "hit" or "miss" as appropriate.  Both players should mark their board. For example, if you call out F6 and your opponent does not have any ship located at F6, your opponent would respond with "miss".  You record the miss F6 by placing a miss mark on your guess board at F6.  Your opponent records the miss by placing a miss mark on his board.

When all of the squares that one of your ships occupies have been hit, the ship will be sunk. You should announce the type of ship sunk.

As soon as all of one player's ships have been sunk, the game ends.

## Code Explanation

### Server Side

The server side is game agnostic i.e. it supports more than BattleShips and any turn based game can be made by changing the game.js file.

#### Data Variables

| Name | Type | Purpose |
|-|-|-|
| UsersInQueue| Queue| Stores the usernames of players waiting for another player to join a game |
| Users | Set | Stores the usernames already taken by the different players to avoid collisions |
| socketOfUser | Array | Used as a mapping of usernames to socketId |
| Games | Array | Stores the different Game objects |
| playerIsIn | Array | Used as a mapping of usernames to GameId |

### Game Object

#### Data Variables

| Name | Type | Purpose |
|-|-|-|
| id | String | Unique Id for the game instance |
| p1 | String | Name of first player |
| p2 | String | Name of second player |
| p1BoardDone | Boolean | Flag set if player one has placed ships  |
| p2BoardDone | Boolean | Flag set if player two has placed ships |
| turnOf | String | Stores name of player whose turn it is |
| playerOneBoard | 2D Array | Marks the points where a ship has been placed by player1 |
| playerTwoBoard | 2D Array  | Marks the points where a ship has been placed by player2 |
| playerOneShip | Array | An array of set holding points for each type of ship for first player |
| playerTwoShip | Array |  An array of set holding points for each type of ship for second player |

#### Functions

| Name | Arguments| Purpose |
|-|-|-|
| --- constructor --- | player1, player2 | Sets the player names and initializes other data members |
| playerReady | player, board data | Processes the ship placement and stores it |
| bothReady | - | Returns true if both players have placed their ships |
| otherPlayer | player | Returns the name of the other player |
| startGame| player | Marks the start of game after both players have placed thier ships, sets the value of turnOf to player|
| makeMove| player, move made| Processes the move and returns the appropritate response for player and opponent |
| makeMove| player, move made|  |



### Client Side

#### Data Variables

| Name | Type | Purpose |
|-|-|:-|
| socket | String | The main socket object |
| username | String | Stores the player's username |
| boardValid | String | Flag for validity of player's board |
| playerBoard | 2D Array  | Marks the points where a ship has been placed by player |
| pointsOfShip | Array | An array of sets holding points for each type of ship for player |
| hor | Array | Stores the orientation of ships (true for horizontal false, otherwise) |
| locked | Array | Stores the states of ships, helps in avoiding changing placememt by mistake |
| myShips | Array | An array of sets holding points for each type of ship for player |
| oppShips | Array | An array of sets holding points for each type of ship for oppopnent |
| otherPlayerBoard | 2D Array | Marks the points where a shot has been made by player, indicating hits and misses |
| myTurn | Boolean | Flag indicating user's turn |
| lastMove | Array | Stores the last move made by user (to avoid clicking by mistake) |

#### Functions

| Name | Arguments| Purpose |
|-|-|-|
| makeToSend | - | Parses the user's board into a form interpret-able by the server |
| boardIsValid | - | Checks the validity of board and sets boardValid flag |
| addShipClass | type, i, j, horizontal | Adds ship's class to a set of points |
| addPointsToShip | type, i, j, horizontal | Add points to the set for a ship's |
| removeShip | type | Removes the ship class from points earlier marked as belonging to a ship |
| choicesChanged | ship | Removes the earlier points and sets the new points |
| checkBounds | valI, valJ, ship, horizontal | Checks ship's boundaries while shipplacement |
| checkOverlap | valI, valJ, ship, horizontal | Checks overlapping ships while shipplacement |
| markShipDown | type | Exposes ship's type when a ship has been sunk | 


### Events

#### Events emitted by Server

| Event | Trigger | Client Action |
|-|-|-|
| userAdded | Server received players chosen username | Depending on the response, either the username is set or player is asked to choose a different name |
| lockJoin | Player wants to play a new game | Disables the join button to prevent multiplee request |
| startGame | A match has been found and a new game has started |  Allow the user to place ships |
| wait| Player's ship placement has been processed and saved | Shows the gameboard |
| go | Both plsyers have chosen ship placement | Depending on whose turn it is, player is allowed to shoot |
| yourMove | Player took a shot | Updates the opponent's board as a result of players shot |
| oppMove | Opponent took a shot | Updates player's board as result of opponents shotand allows to take a shot |
| moveError | Player took a shot and an error occurred | Displays error and allows to shoot again |

#### Events Emitted by Client

| Event | Trigger | Server Action |
|-|-|-|
| addUser | User has choosen username |  |
| updateSocket | Site loaded and a username has been set already | Server updates its map of username to socketId |
| join | User has chosen to play | Server finds an opponent for the player |
| boardMade | User has finalized his board | Server processes and stores the plaayers ship placement  |
| makeMove | User made a move | Server processes the move and sends reponse to player and opponentro |


## References

- 
-  asdasd
- sdaasd
