
Hey! I'm your first Markdown document in **StackEdit**[^stackedit]. Don't delete me, I'm very helpful! I can be recovered anyway in the **Utils** tab of the <i class="icon-cog"></i>


Documents
-------------

 **offline!**

> **Note:** 
> 
> - StackEdit is accessible offline after the application has been loaded for the first time.
> - Clearing your browser's data may **delete all your local documents!** Make sure your documents are synchronized with **Google Drive** or **Dropbox** (check out the [ Synchronization](#synchronization) section).
 
---

>  **Tip:** Check out the [<i class="icon-upload"></i> Publish a document](#publish-a-document) section for a description of the different output formats
> 
>> **Note:** You can find more information about **Markdown** syntax [here][2]
> 
> 
> **Note:** The  button is disabled when you have no document to synchronize.

>> **Note:** If you delete the file from **Google Drive** or from **Dropbox**, the document will no longer be synchronized with that location.

#### <i class="icon-file"></i> Create a document

*All your local documents* are listed in the document panel. You can switch from one to another by clicking a document in the list or you can toggle documents using <kbd>Ctrl+[</kbd> and <kbd>Ctrl+]</kbd>.

Item     | Value
-------- | ---
Computer | $1600


| Item        | Value | Qty   |
| :-| ----: | :--: |
| Computer    | $1600 |  5    |


Term 1
Term 2
:   Definition A
:   Definition B

Term 3

:   Definition C

:   Definition D

	> part of definition D


You can create footnotes like this[^footnote].

  [^footnote]: Here is the *text* of the **footnote**.


### SmartyPants

SmartyPants converts ASCII punctuation characters into "smart" typographic punctuation HTML entities. For example:

|                  | ASCII                        | HTML              |
 ----------------- | ---------------------------- | ------------------
| Single backticks | `'Isn't this fun?'`            | 'Isn't this fun?' |
| Quotes           | `"Isn't this fun?"`            | "Isn't this fun?" |
| Dashes           | `-- is en-dash, --- is em-dash` | -- is en-dash, --- is em-dash |


----

The *Gamma function* satisfying $\Gamma(n) = (n-1)!\quad\forall n\in\mathbb N$ is via the Euler integral

$$
\Gamma(z) = \int_0^\infty t^{z-1}e^{-t}dt\,.
$$

```sequence
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks!
```
---
```flow
st=>start: Start
e=>end
op=>operation: My Operation
cond=>condition: Yes or No?

st->op->cond
cond(yes)->e
cond(no)->op
```

 [^stackedit]: [StackEdit](https://stackedit.io/) is a full-featured, open-source Markdown editor based on PageDown, the Markdown library used by Stack Overflow and the other Stack Exchange sites.
nnnn

  [1]: http://math.stackexchange.com/
  [2]: http://daringfireball.net/projects/markdown/syntax "Markdown"

---

[TOC]

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

The WebSocket protocol was standardized by the IETF( --- ) as RFC 6455 in 2011, and the WebSocket API in Web IDL is being standardized by the W3C( --- ).

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

In addition to Upgrade headers, the client sends a Sec-WebSocket-Key header containing base64-encoded random bytes, and the server replies with a hash of the key in the Sec-WebSocket-Accept header. This is intended to prevent a caching proxy from re-sending a previous WebSocket conversation,[32] and does not provide any authentication, privacy or integrity. The hashing function appends the fixed string 258EAFA5-E914-47DA-95CA-C5AB0DC85B11 (a GUID) to the value from Sec-WebSocket-Key header (which is not decoded from base64), applies the SHA-1 hashing function, and encodes the result using base64.[33]

Once the connection is established, the client and server can send WebSocket data or text frames back and forth in full-duplex mode. The data is minimally framed, with a small header followed by payload. WebSocket transmissions are described as "messages", where a single message can optionally be split across several data frames. This can allow for sending of messages where initial data is available but the complete length of the message is unknown (it sends one data frame after another until the end is reached and marked with the FIN bit). With extensions to the protocol, this can also be used for multiplexing several streams simultaneously (for instance to avoid monopolizing use of a socket for a single large payload).

It is important (from a security perspective) to validate the "Origin" header during the connection establishment process on the serverside (against the expected origins) to avoid Cross-Site WebSocket Hijacking attacks, which might be possible when the connection is authenticated with Cookies or HTTP authentication. It is better to use tokens or similar protection mechanisms to authenticate the WebSocket connection when sensitive (private) data is being transferred over the WebSocket.[34]

The WebSocket protocol specification defines ws and wss as two new uniform resource identifier (URI) schemes that are used for unencrypted and encrypted connections, respectively. Apart from the scheme name and fragment (# is not supported), the rest of the URI components are defined to use URI generic syntax.

---

## Node.js

Node.js is an open-source, cross-platform JavaScript run-time environment for executing JavaScript code server-side. While JavaScript was historically used primarily for client-side scripting, in which scripts written in JavaScript are embedded in a webpage's HTML, to be run client-side by a JavaScript engine in the user's web browser, Node.js enables JavaScript to be used for server-side scripting, and runs scripts server-side to produce dynamic web page content before the page is sent to the user's web browser.

Node.js allows the creation of Web servers and networking tools using JavaScript and a collection of "modules" that handle various core functionality. Modules are provided for file system I/O, networking (DNS, HTTP, TCP, TLS/SSL, or UDP), binary data (buffers), cryptography functions, data streams and other core functions.

Node.js is primarily used to build network programs such as Web servers. The biggest difference between Node.js and other languages is that most functions in others block until completion (commands execute only after previous commands have completed), while functions in Node.js are designed to be non-blocking (commands execute in parallel, and use callbacks to signal completion or failure).
Node.js was created because concurrency is difficult in many server-side programming languages, and often leads to poor performance.

Node.js was built on the Google V8 JavaScript engine since it was open-source under the BSD license, extremely fast, and proficient with internet fundamentals like HTTP, DNS, TCP.[27] Also, JavaScript was a well-known language, making Node.js immediately accessible to the entire web development community.[27]



#### Threading

Node.js operates on a single thread, using non-blocking I/O calls, allowing it to support tens of thousands of concurrent connections without incurring the cost of thread context switching. The design of sharing a single thread between all the requests that uses the observer pattern is intended for building highly concurrent applications, where any function performing I/O must use a callback. In order to accommodate the single-threaded event loop, Node.js utilizes the libuv library that in turn uses a fixed-sized threadpool that is responsible for some of the non-blocking asynchronous I/O operations.

A downside of this single-threaded approach is that Node.js doesn't allow vertical scaling by increasing the number of CPU cores of the machine it is running on without using an additional module, such as cluster, StrongLoop Process Manager or pm2. However, developers can increase the default number of threads in the libuv threadpool; these threads are likely to be distributed across multiple cores by the server operating system.

Execution of parallel tasks in Node.js is handled by a thread pool. The main thread call functions post tasks to the shared task queue that threads in the thread pool pull and execute. Inherently non-blocking system functions like networking translates to kernel-side non-blocking sockets, while inherently blocking system functions like file I/O run in a blocking way on its own thread. When a thread in the thread pool completes a task, it informs the main thread of this that in turn wakes up and execute the registered callback. Since callbacks are handled in serial on the main thread, long lasting computations and other CPU-bound tasks will freeze the entire event-loop until completion.[citation needed]

#### V8
V8 is the JavaScript execution engine built for Google Chrome and open-sourced by Google in 2008. Written in C++, V8 compiles JavaScript source code to native machine code instead of interpreting it in real time.

Node.js uses libuv to handle asynchronous events. Libuv is an abstraction layer for network and file system functionality on both Windows and POSIX-based systems like Linux, macOS and Unix.


The core functionality of Node.js resides in a JavaScript library. The Node.js bindings, written in C++, connect these technologies to each other and to the operating system.

#### Event loop
Node.js registers itself with the operating system in order to be notified when a connection is made, and the operating system will issue a callback. Within the Node.js runtime, each connection is a small heap allocation. Traditionally, relatively heavyweight OS processes or threads handled each connection. Node.js uses an event loop for scalability, instead of processes or threads. In contrast to other event-driven servers, Node.js's event loop does not need to be called explicitly. Instead callbacks are defined, and the server automatically enters the event loop at the end of the callback definition. Node.js exits the event loop when there are no further callbacks to be performed.

### Expressjs
Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
Express provides a thin layer of fundamental web application features, without obscuring Node.js features that you know and love.

### Socket.io
Socket.IO is a JavaScript library for realtime web applications. It enables realtime, bi-directional communication between web clients and servers. It has two parts: a client-side library that runs in the browser, and a server-side library for Node.js. Both components have a nearly identical API. Like Node.js, it is event-driven.

Socket.IO primarily uses the WebSocket protocol with polling as a fallback option, while providing the same interface. Although it can be used as simply a wrapper for WebSocket, it provides many more features, including broadcasting to multiple sockets, storing data associated with each client, and asynchronous I/O.