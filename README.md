# WebRTC Educational Demo

This project is an interactive educational demo designed to teach the fundamental concepts of WebRTC in a hands-on way. Users can explore the roles of both a "streamer" and a "viewer" to understand the entire peer-to-peer connection process.

## Features

- **Interactive Tours:** Guided tours for both the streamer and viewer roles, explaining each step of the WebRTC connection process with code snippets.
- **Streamer Mode:** Share your screen and generate a WebRTC offer (SDP) to send to a viewer.
- **Viewer Mode:** Paste a received SDP offer to establish a connection and view the remote stream.
- **Educational Content:** The application provides explanations of core WebRTC concepts like P2P connections, security, and the roles of STUN/TURN servers.
- **Real-time Logging:** A log panel displays internal WebRTC events as they happen, providing insight into the connection process.

## Tech Stack

- **Vue 3:** A progressive JavaScript framework for building user interfaces.
- **Vite:** A fast build tool and development server for modern web projects.
- **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
- **Element Plus:** A Vue 3 based component library for building beautiful UIs.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```