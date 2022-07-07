# electrum-client-js

JavaScript implementation of [Electrum Protocol] Client.

This is a library that can communicate with the [ElectrumX Server]
on `tcp`, `ssl`, `ws` and `wss` protocols. 

Works in node.js and browser.

Implements methods described in [Electrum Protocol methods] documentation.

Subscriptions and notifications are also supported, please see [example](example/subscribe.js).

## Continuous Integration

Latest [CircleCI](.circleci/) build status:

[![CircleCI](https://circleci.com/gh/keep-network/electrum-client-js.svg?style=svg)](https://circleci.com/gh/keep-network/electrum-client-js)


## Install

```
npm install --save @keep-network/electrum-client-js
```

## Usage

```js
import { ElectrumClient } from "../src/electrum/client";
async function main() {
  const client = new ElectrumClient("electrum.bitaroo.net", 50002, "ssl");

  try {
    await client.connect(
      "electrum-client-js", // optional client name
      "1.4.2" // optional protocol version
    );

    const header = await client.blockchain_headers_subscribe();
    console.log("Current header:", header);

    await client.close();
  } catch (err) {
    console.error(err);
  }
}

main();
```

See more [examples](example/).


[Electrum Protocol]: https://electrumx.readthedocs.io/en/latest/protocol.html
[Electrum Protocol methods]: https://electrumx.readthedocs.io/en/latest/protocol-methods.html
[ElectrumX Server]: https://electrumx.readthedocs.io/en/latest/
