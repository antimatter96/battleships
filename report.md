MAIN HEADING
=============

## WEBSOCKETS

### What was wrong with HTTP ?
The web has been largely built around the so-called request/response paradigm of HTTP. A client loads up a web page and then nothing happens until the user clicks onto the next page. Around 2005, AJAX (Asynchronous JavaScript And XML) started to make the web feel more dynamic. Still, all HTTP communication was steered by the client, which required user interaction or periodic polling to load new data from the server.

Technologies that enable the server to send data to the client in the very moment when it knows that new data is available have been around for quite some time. They go by names such as "Push" or "Comet". One of the most common hacks to create the illusion of a server initiated connection is called long polling. With long polling, the client opens an HTTP connection to the server which keeps it open until sending response. Whenever the server actually has new data it sends the response. Long polling and the other techniques work quite well, however, all of these work-arounds share one problem: They carry the overhead of HTTP, which doesn't make them well suited for low latency applications.

### WebSockets

WebSocket is a computer communications protocol, providing full-duplex communication channels over a single TCP connection. 
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

---

## Node.js

Node.js is an open-source, cross-platform JavaScript run-time environment for executing JavaScript code server-side. JavaScript was historically used primarily for client-side scripting, in which scripts written in JavaScript are embedded in a webpage's HTML, to be run client-side by a JavaScript engine in the user's web browser, Node.js enables JavaScript to be used for server-side scripting, and runs scripts server-side to produce dynamic web page content.

Node.js allows the creation of Web servers and networking tools using JavaScript and a collection of "modules" that handle various core functionality. Modules are provided for file system I/O, networking (DNS, HTTP, TCP, TLS/SSL, or UDP), binary data (buffers), cryptography functions, data streams and other core functions.

Node.js is primarily used to build network programs such as Web servers. The biggest difference between Node.js and other languages is that most functions in others block until completion (commands execute only after previous commands have completed), while functions in Node.js are designed to be non-blocking (commands execute in parallel, and use callbacks to signal completion or failure).
Node.js was created because concurrency is difficult in many server-side programming languages, and often leads to poor performance.

Node.js is built on the Google V8 JavaScript engine.
V8 is the JavaScript execution engine built for Google Chrome and open-sourced by Google in 2008. Written in C++, V8 compiles JavaScript source code to native machine code instead of interpreting it in real time.

Node.js uses libuv to handle asynchronous events. Libuv is an abstraction layer for network and file system functionality on both Windows and POSIX-based systems like Linux, macOS and Unix.

The core functionality of Node.js resides in a JavaScript library. The Node.js bindings, written in C++, connect these technologies to each other and to the operating system.

#### Threading

Node.js operates on a single thread, using non-blocking I/O calls, allowing it to support tens of thousands of concurrent connections without incurring the cost of thread context switching. The design of sharing a single thread between all the requests that uses the observer pattern is intended for building highly concurrent applications, where any function performing I/O must use a callback. In order to accommodate the single-threaded event loop, Node.js utilizes the libuv library that in turn uses a fixed-sized threadpool that is responsible for some of the non-blocking asynchronous I/O operations.

Execution of parallel tasks in Node.js is handled by a thread pool. The main thread call functions post tasks to the shared task queue that threads in the thread pool pull and execute. Inherently non-blocking system functions like networking translates to kernel-side non-blocking sockets, while inherently blocking system functions like file I/O run in a blocking way on its own thread. When a thread in the thread pool completes a task, it informs the main thread of this that in turn wakes up and execute the registered callback. Since callbacks are handled in serial on the main thread, long lasting computations and other CPU-bound tasks will freeze the entire event-loop until completion.

#### Event loop

Node.js registers itself with the operating system in order to be notified when a connection is made, and the operating system will issue a callback. Within the Node.js runtime, each connection is a small heap allocation. Traditionally, relatively heavyweight OS processes or threads handled each connection. Node.js uses an event loop for scalability, instead of processes or threads. In contrast to other event-driven servers, Node.js's event loop does not need to be called explicitly. Instead callbacks are defined, and the server automatically enters the event loop at the end of the callback definition. Node.js exits the event loop when there are no further callbacks to be performed.

### Expressjs

Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
Express provides a thin layer of fundamental web application features, without obscuring Node.js features that you know and love.

### Socket.io
Socket.IO is a JavaScript library for realtime web applications. It enables realtime, bi-directional communication between web clients and servers. It has two parts: a client-side library that runs in the browser, and a server-side library for Node.js. Both components have a nearly identical API. Like Node.js, it is event-driven.

Socket.IO primarily uses the WebSocket protocol with polling as a fallback option, while providing the same interface. Although it can be used as simply a wrapper for WebSocket, it provides many more features, including broadcasting to multiple sockets, storing data associated with each client, and asynchronous I/O.

## Event driven programming using Socket.io and Node.js


```js
socket.on('eventName', function (data) {
	...
	...		
});
```

```js
socket.on('eventName', function (data) {
	...
	socket.emit('myOtherEvent', otherData);	
});
```

We can send data to a client using its socket-Id which can be accessed by its `id`;

```js
let socketId = socket.id;
...
socket.to( socketId ).emit('eventName', data);
```
# Code Explanation

## Server Side

The server side is game agnostic i.e. it supports more than BattleShips and any turn based game can be made by changing the game.js file.

### Data Structures Used

| Name | Type | Purpose |
|-|-|-|
| UsersInQueue| Queue| Stores the usernames of players waiting for another player to join a game |
| Users | Set | Stores the usernames already taken by the different players to avoid collisions |
| socketOfUser | Array | Used as a mapping of usernames to socketId |
| Games | Array | Stores the different Game objects |
| playerIsIn | Array | Used as a mapping of usernames to GameId |

### Events

| Events | Purpose |
|-|-|
| addUser | Stores the usernames of players waiting for another player to join a game |
| updatePlayerSocket | Stores the usernames already taken by the different players to avoid collisions |
| join | Used as a mapping of usernames to socketId |
| boardMade | Stores the different Game objects |
| makeMove | Used as a mapping of usernames to GameId |


---

## Game Object

### Data Structures

| Name | Type | Purpose |
|-|-|-|
| id | String |  |
| p1 | String |  |
| p2 | String |  |
| p1BoardDone | Boolean |  |
| p2BoardDone | Boolean |  |
| turnOf | String |  |
| playerOneBoard |  |  |
| playerTwoBoard |  |  |
| playerOneShip |  |  |
| playerTwoShip |  |  |
| lengthOfType | Object |
| arrOfI | Array |
| arrOfJ | Array |

### Functions

| Name | Arguments| Purpose |
|-|-|-|
| --constructor-- | player1,player2 |  |
| playerReady | String |  |
| bothReady | String |  |
| otherPlayer | Boolean |  |
| startGame| Boolean |  |
| makeMove| String |  |


---

## Client Side

### Data Structures

| Name | Type | Purpose |
|-|-|-|
| socket | String |  |
| username | String |  |
| lockName | String |  |
| lockJoin | Boolean |  |
| lockReady | Boolean |  |
| boardValid | String |  |
| lengthOfType |  |  |
| arrOfI |  |  |
| arrOfJ |  |  |
| playerBoard |  |  |
| pointsOfShip | Object |
| hor | Array |
| placedBefore | Array |
| hor | Array |
| hor | Array |
| locked | Array |
| myShips | Array |
| oppShips | Array |
| otherPlayerBoard | Array |
| myTurn | Array |
| lastMove | Array |

### Functions

| Name | Arguments| Purpose |
|-|-|-|
| --constructor-- | player1,player2 |  |
| playerReady | String |  |
| bothReady | String |  |
| otherPlayer | Boolean |  |
| startGame| Boolean |  |
| makeMove| String |  |

### Events

| Events | Purpose |
|-|-|
| addUser | Stores the usernames of players waiting for another player to join a game |
| updatePlayerSocket | Stores the usernames already taken by the different players to avoid collisions |
| join | Used as a mapping of usernames to socketId |
| boardMade | Stores the different Game objects |
| makeMove | Used as a mapping of usernames to GameId |