import { Server } from '@hocuspocus/server';

const hocuspocusServer = new Server({
  port: 1234,
  async onConnect(data) {
    console.log(`[Hocuspocus] Client connected to room: ${data.documentName}`);
  },
  async onDisconnect(data) {
    console.log(`[Hocuspocus] Client disconnected from room: ${data.documentName}`);
  }
});

export default hocuspocusServer;
