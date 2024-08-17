# Sprocket Pan

A tool for sending HTTP(S) requests over the internet. Similar to [Postman](https://www.postman.com/) and [Insomnia](https://insomnia.rest/).

## Docs

[Sprocket Pan Docs Website](https://sprocketpan.com)

## Running Locally

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Recommended Extentions](https://github.com/itaifish/Sprocket-Pan/blob/main/.vscode/extensions.json)

### Prerequisites

1. [nodejs](https://nodejs.org/en) Version 18+
2. [yarn](https://yarnpkg.com/) - You can install from `npm`, which comes with `node`
3. [Tauri's Pre-Reqs](https://tauri.app/v1/guides/getting-started/prerequisites)

### How to Run

1. `yarn` (install dependancies)
2. `yarn run start` (run locally)

## Roadmap

Key:
☐: Ready to start
❗: Work in progress
✅: Complete

- Add workspaces ✅
- Import / Export work ✅
  - Imports from:
    - Sprocket Pan ✅
    - Postman ✅
    - Insomnia ✅
    - Swagger / OpenAPI ✅
- Refactor global state ✅
- Refactor Environment input/output (Janky) ✅
- Show debug logs option in settings ☐
- Scratchpad (Requests / Scripts not associated with a service) ❗
  - Scripts ✅
  - Requests ❗
- Secrets Handling ☐
  - Let certain fields in environments be secrets ☐
  - Don't export secrets in exports ☐
  - Maybe put secrets in a seperate file that can be gitignored? ☐
  - Secret encryption when stored locally? idk ☐
- Inputs/outputs besides JSON ❗
  - Yaml / XML / HTML / raw text ✅
  - Files ☐
- Command Pallete ☐
- Run Sprocket Pan in CLI ☐
- Automatic Updates (No need to redownload the program) ✅
- Audit trail for requests ✅
- Tabs ❗
  - Dragging and Dropping ☐
  - Favorites ☐
  - Close all / all to the right/left ☐
  - Selection History ✅
