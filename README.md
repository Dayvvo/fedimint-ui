# Fedimint UI Projects

## What's Inside

This project includes the following apps / packages:

### Apps

- `guardian-ui`: Web app experience for setting up and administering fedimints. This is used by the Fedimint guardians
- `gateway-ui`: Web app experience for managing Fedimint gateways. This is used by Gateway administrators

### Packages

- `ui`: Shared React UI component library for building Fedimint UI experiences
- `eslint-config`: Shared `eslint` configurations (includes `eslint-plugin-react` and `eslint-config-prettier`)
- `tsconfig`: Shared `tsconfig.json`s used throughout Fedimint UI apps

## Development

From root repo directory:

1. Ensure Docker and yarn/nodejs are installed.
1. Run `docker compose up` (brings up a 2 server Fedimint)
1. `yarn install` (First time only)
1. `yarn build` (Needs to be rerun when code in `packages` change)
1. You can run any of the following commands during development

- `yarn dev` - Starts development servers and file watchers for all apps and packages
  - Due to port conflicts, there are dev commands for each app to run individually
    - `yarn dev:gateway-ui`
    - `yarn dev:guardian-ui`
- `yarn test` - Tests all apps and packages in the project
- `yarn build` - Build all apps and packages in the project
- `yarn clean` - Cleans previous build outputs from all apps and packages in the project
- `yarn format` - Fixes formatting in all apps and packages in the project
