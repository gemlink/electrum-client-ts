import { EventEmitter } from 'events';
import { TCPSocketClient } from './socket_client_tcp';
// import { WebSocketClient } from './socket_client_ws';
import { MessageParser } from './util';

export class SocketClient {
  id = 0;
  host;
  port;
  protocol;
  options;
  status = 0;
  callback_message_queue = {};
  subscribe = new EventEmitter();
  mp;
  client: TCPSocketClient;
  constructor(host, port, protocol, options) {
    this.id = 0;
    this.host = host;
    this.port = port;
    this.protocol = protocol;
    this.options = options;
    this.status = 0;
    this.callback_message_queue = {};
    this.subscribe = new EventEmitter();
    this.mp = new MessageParser((body, n) => {
      this.onMessage(body, n);
    });

    switch (protocol) {
      case 'tcp':
      case 'tls':
      case 'ssl':
        this.client = new TCPSocketClient(this, host, port, protocol, options);
        break;
      // case 'ws':
      // case 'wss':
      //   this.client = new WebSocketClient(this, host, port, protocol, options);
      //   break;
      default:
        throw new Error(`invalid protocol: [${protocol}]`);
    }
  }

  async connect(clientName, electrumProtocolVersion, persistencePolicy = null) {
    if (this.status === 1) {
      return Promise.resolve();
    }

    this.status = 1;
    return this.client.connect();
  }

  close() {
    if (this.status === 0) {
      return;
    }

    this.client.close();

    this.status = 0;
  }

  response(msg) {
    const callback = this.callback_message_queue[msg.id];

    if (callback) {
      delete this.callback_message_queue[msg.id];
      if (msg.error) {
        callback(msg.error.message);
      } else {
        callback(null, msg.result);
      }
    } else {
      console.log("Can't get callback");
    }
  }

  onMessage(body, n) {
    const msg = JSON.parse(body);
    if (msg instanceof Array) {
      // don't support batch request
    } else {
      if (msg.id !== void 0) {
        this.response(msg);
      } else {
        this.subscribe.emit(msg.method, msg.params);
      }
    }
  }

  onConnect() {
    this.subscribe.emit('socket.connected');
  }

  onReady() {
    this.subscribe.emit('ready');
  }

  onClose() {
    this.status = 0;
    Object.keys(this.callback_message_queue).forEach((key) => {
      this.onError('close connect');
      delete this.callback_message_queue[key];
    });
  }

  onRecv(chunk) {
    this.mp.run(chunk);
  }

  onEnd(error) {
    console.log(`onEnd: [${error}]`);
  }

  onError(error) {
    this.subscribe.emit('socket.error', `onError: [${error}]`);
  }
}
