# Project Assignment

This repository contains a simple **NestJS** backend and a **React** frontend.

## Server

The `server` folder holds a minimal NestJS application. After running `npm install` to install dependencies, run `npm run build` to compile TypeScript. Before starting the server you may need to run database migrations using `npm run migration:run`. Finally start the server with `npm start`.

The server listens on the port defined by the `PORT` environment variable (default `3001`). You can copy `server/.env.example` to `.env` and adjust if needed.

## Client

The `client` folder holds a basic React application bundled with webpack. After installing dependencies you can run `npm start` to serve the frontend.

Client requests are sent to the URL defined by `SERVER_URL` (default `http://localhost:3001`). Copy `client/.env.example` to `.env` to configure a different backend URL.
