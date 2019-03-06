# feathers-json-patch

Add [JSON Patch](http://jsonpatch.com/) support to any [Feathers](https://feathersjs.com) database adapter or service.

```bash
$ npm install --save feathers-json-patch
```

## Usage

### Feathers server

An example using the [feathers-memory](https://github.com/feathersjs-ecosystem/feathers-memory) adapter.

```js
const memoryService = require('feathers-memory');
const withJsonPatch = require('feathers-json-patch');

const service = withJsonPatch(memoryService);

app.use('/messages', service());
```

Another example, using service constructor:

```js
const MemoryService = require('feathers-memory').Service;
const withJsonPatch = require('feathers-json-patch');

const MyService = withJsonPatch(memoryService);

app.use('/messages', new MyService());
```

### Feathers client

```js
import feathers from '@feathersjs/client';
import { compare } from 'fast-json-patch';

const client = feathers().configure(...);

const id = 1;

const message = await client.service('/messages').get(id);

const newValues = {
  ...message,
  text: 'My updated message!',
  tags: ['info']
};

// Generate a JSON patch object
const diff = compare(message, newValues);

// Optional check, but no need to send
// a patch request if the diff has length == 0
if (diff.length) {
  client.service('/messages').patch(id, diff);
}
```

### HTTP

```http
PATCH /messages/1 HTTP/1.1
Accept: application/json

[
    {
        "op": "replace",
        "path": "/text",
        "value": "My updated message!"
    },
    {
        "op": "add",
        "path": "/tags",
        "value": ["info"]
    }
]



HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 1,
    "text": "My updated message!",
    "tags": ["info"]
}
```
