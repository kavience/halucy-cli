## Halucy

Halucy is a node framework based on restify and typescript, this is halucy cli, make project quickly .

## Usage

### Install

```sh
npm i -g halucy
```

### Commands

Halucy commands can make project more simple and quick.

#### init

init a halucy project

#### start

start halucy server.

| option       | short | effect                                                            |
| ------------ | ----- | ----------------------------------------------------------------- |
| --watch      | -w    | start server with watch mode                                      |
| --dir        | -d    | specify running directory, default is dist                        |
| --config     | -c    | specify file configuration, default is .env                       |
| --typescript | -t    | specify typescript file configuration, default is typescript.json |

### build

because halucy is code on typescript, so it should build halucy framework as javascript.

| option       | short | effect                                                            |
| ------------ | ----- | ----------------------------------------------------------------- |
| --dir        | -d    | specify running directory, default is dist                        |
| --typescript | -t    | specify typescript file configuration, default is typescript.json |

### TODO

- [ ] complete `init`, `start`, `build` command.
- [ ] add `make` command, can make controller, model, schema more quick.
- [ ] complete docs.

