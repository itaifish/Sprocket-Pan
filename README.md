# Sprocket Pan

A tool for sending HTTP(S) requests over the internet. Similar to [Postman](https://www.postman.com/) and [Insomnia](https://insomnia.rest/).

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Prerequisites

<https://tauri.app/v1/guides/getting-started/prerequisites/>

## How to run

1. `yarn`
2. `yarn run start`

## Roadmap

- Add workspaces
- Import / Export work
  - Imports from:
    - Sprocket Pan
    - Postman
    - Insomnia
- Refactor global state
- Refactor Environment input/output (Janky)
- Show debug logs option in settings
- Scratchpad (Requests / Scripts not associated with a service)
- Secrets Handling
  - Let certain fields in environments be secrets
  - Don't export secrets in exports
  - Maybe put secrets in a seperate file that can be gitignored?
  - Secret encryption when stored locally? idk
- Inputs/outputs besides JSON
