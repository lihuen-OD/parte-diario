import { app } from './app';
import { env } from './config/env';
import type { Server } from 'http';

declare global {
  // eslint-disable-next-line no-var
  var __parteDiarioServer: Server | undefined;
}

async function startServer() {
  if (globalThis.__parteDiarioServer) {
    await new Promise<void>((resolve) => {
      globalThis.__parteDiarioServer?.close(() => resolve());
    });
  }

  const server = app.listen(env.PORT, () => {
    console.log(`Backend escuchando en http://localhost:${env.PORT}`);
  });

  globalThis.__parteDiarioServer = server;

  const shutdown = async () => {
    if (!globalThis.__parteDiarioServer) return;

    const currentServer = globalThis.__parteDiarioServer;
    globalThis.__parteDiarioServer = undefined;

    await new Promise<void>((resolve) => {
      currentServer.close(() => resolve());
    });
  };

  process.once('SIGINT', () => {
    void shutdown().finally(() => process.exit(0));
  });

  process.once('SIGTERM', () => {
    void shutdown().finally(() => process.exit(0));
  });
}

void startServer();
