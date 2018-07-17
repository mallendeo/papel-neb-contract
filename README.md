# Papel Nebulas Smart Contract

## Clone & Install

```bash
$ git clone https://github.com/mallendeo/papel-neb-contract
$ cd papel-neb-contract
$ yarn
```

## Build

```bash
$ yarn build
```

Compiled file will be on the `dist/` directory.

## Test
```bash
$ yarn test
$ yarn test:watch
$ yarn test:db # save db on ./tmp
```

## Deploy
```bash
$ P_KEY="unencrypted_private_key" yarn deploy
$ P_KEY="unencrypted_private_key" yarn deploy true # populate db
```

# License
GNU General Public License v3.0
