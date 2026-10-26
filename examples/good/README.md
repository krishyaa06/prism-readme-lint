<p align="center"><img src="assets/logo.svg" alt="Orbit logo" width="96"></p>

# Orbit

Orbit is a tiny, dependency-free task runner for monorepos. It reads the scripts in every
`package.json`, figures out which packages changed since your last commit, and runs only the
tasks that matter — in parallel, with a clean, grouped log. Think `turbo run`, without the config.

![Orbit running three tasks in parallel](assets/logo.svg)

## Installation

```bash
npm install -g orbit-runner
```

## Usage

```bash
orbit build          # build changed packages and their dependents
orbit test --all     # run every package's tests
```

See [Configuration](#configuration) for options.

## Configuration

Add an `orbit` key to the root `package.json`:

```json
{ "orbit": { "parallel": 4, "ignore": ["docs"] } }
```

## Contributing

Pull requests are welcome. Run `npm test` before opening one.

## License

MIT
