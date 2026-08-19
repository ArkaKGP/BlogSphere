const WebSocket = require('ws');
const Y = require('yjs');
const syncProtocol = require('y-protocols/dist/sync.cjs');
const awarenessProtocol = require('y-protocols/dist/awareness.cjs');
const encoding = require('lib0/dist/encoding.cjs');
const decoding = require('lib0/dist/decoding.cjs');
const Blog = require('../models/blogmodel');

const messageSync = 0;
const messageAwareness = 1;

// Map of docName (blogId) -> Room Object
// Room Object: { doc: Y.Doc, awareness: Awareness, clients: Set<WebSocket>, saveTimer: NodeJS.Timeout | null }
const docs = new Map();

/**
 * Converts a Y.XmlFragment (or Y.Doc default fragment) to an HTML string.
 */
const yFragmentToHTML = (xmlFragment) => {
  if (!xmlFragment) return '';
  const raw = xmlFragment.toString();
  if (!raw) return '';

  return raw
    .replace(/<paragraph>/g, '<p>')
    .replace(/<\/paragraph>/g, '</p>')
    .replace(/<heading level="1">/g, '<h1>')
    .replace(/<heading level="2">/g, '<h2>')
    .replace(/<heading level="3">/g, '<h3>')
    .replace(/<\/heading>/g, '</h1>')
    .replace(/<bulletList>/g, '<ul>')
    .replace(/<\/bulletList>/g, '</ul>')
    .replace(/<orderedList>/g, '<ol>')
    .replace(/<\/orderedList>/g, '</ol>')
    .replace(/<listItem>/g, '<li>')
    .replace(/<\/listItem>/g, '</li>')
    .replace(/<codeBlock>/g, '<pre><code>')
    .replace(/<\/codeBlock>/g, '</code></pre>')
    .replace(/<blockquote/g, '<blockquote')
    .replace(/<\/blockquote>/g, '</blockquote>');
};

/**
 * Helper to deduplicate repeated HTML content blocks (e.g. 2x or 3x duplications)
 */
const deduplicateHtmlContent = (content) => {
  if (!content || typeof content !== 'string') return content;
  const trimmed = content.trim();

  // Check for 3x exact repetition
  if (trimmed.length % 3 === 0) {
    const chunkLen = trimmed.length / 3;
    const c1 = trimmed.slice(0, chunkLen);
    const c2 = trimmed.slice(chunkLen, chunkLen * 2);
    const c3 = trimmed.slice(chunkLen * 2);
    if (c1 === c2 && c2 === c3) {
      return c1;
    }
  }

  // Check for 2x exact repetition
  if (trimmed.length % 2 === 0) {
    const chunkLen = trimmed.length / 2;
    const c1 = trimmed.slice(0, chunkLen);
    const c2 = trimmed.slice(chunkLen);
    if (c1 === c2) {
      return c1;
    }
  }

  return content;
};

/**
 * Persists current Y.Doc HTML content to MongoDB
 */
const saveRoomToDB = async (docName, room) => {
  try {
    const xmlFragment = room.doc.getXmlFragment('default');
    const rawHtml = yFragmentToHTML(xmlFragment);
    const htmlContent = deduplicateHtmlContent(rawHtml);

    if (htmlContent) {
      await Blog.findByIdAndUpdate(docName, { description: htmlContent });
      console.log(`💾 Automatically saved blog ${docName} to MongoDB.`);
    }
  } catch (err) {
    console.error(`❌ Error persisting Yjs doc ${docName} to MongoDB:`, err.message);
  }
};

/**
 * Schedule debounced persistence to MongoDB
 */
const scheduleSave = (docName, room) => {
  if (room.saveTimer) {
    clearTimeout(room.saveTimer);
  }
  room.saveTimer = setTimeout(() => {
    saveRoomToDB(docName, room);
    room.saveTimer = null;
  }, 3000); // 3-second debounce
};

/**
 * Returns or initializes a Yjs Room for a given Blog ID
 */
const getOrCreateRoom = async (docName) => {
  let room = docs.get(docName);
  if (room) return room;

  const ydoc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(ydoc);

  room = {
    doc: ydoc,
    awareness: awareness,
    clients: new Set(),
    saveTimer: null,
  };

  docs.set(docName, room);

  // Listen for Y.Doc updates to broadcast to clients & schedule persistence
  ydoc.on('update', (update, origin) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);

    for (const client of room.clients) {
      if (client !== origin && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }

    scheduleSave(docName, room);
  });

  // Listen for awareness updates (cursor position, username, color)
  awareness.on('update', ({ added, updated, removed }, origin) => {
    const changedClients = added.concat(updated, removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
    );
    const message = encoding.toUint8Array(encoder);

    for (const client of room.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  return room;
};

/**
 * Sets up Yjs WebSocket Server attached to HTTP Server
 */
const initYWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ noServer: true });

  // Handle upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url;

    // Delegate Socket.io requests to Socket.io handler
    if (pathname.startsWith('/socket.io')) {
      return;
    }

    // Handle Y-WebSocket connection upgrades
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', async (ws, request) => {
    // Extract room name (blog ID) from request URL path
    // e.g. /y-websocket/64a... or /64a...
    const urlParts = request.url.split('?')[0].split('/').filter(Boolean);
    const docName = urlParts[urlParts.length - 1] || 'default-room';

    console.log(`🔌 Yjs WebSocket client connected to room: ${docName}`);

    const room = await getOrCreateRoom(docName);
    room.clients.add(ws);

    // Send initial sync step 1
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, room.doc);
    ws.send(encoding.toUint8Array(encoder));

    // Send awareness state if any active clients exist
    if (room.awareness.states.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, messageAwareness);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          room.awareness,
          Array.from(room.awareness.states.keys())
        )
      );
      ws.send(encoding.toUint8Array(awarenessEncoder));
    }

    // Handle incoming client messages
    ws.on('message', (message) => {
      try {
        const decoder = decoding.createDecoder(new Uint8Array(message));
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
          case messageSync: {
            const replyEncoder = encoding.createEncoder();
            encoding.writeVarUint(replyEncoder, messageSync);
            syncProtocol.readSyncMessage(decoder, replyEncoder, room.doc, ws);

            if (encoding.length(replyEncoder) > 1) {
              ws.send(encoding.toUint8Array(replyEncoder));
            }
            break;
          }
          case messageAwareness: {
            awarenessProtocol.applyAwarenessUpdate(
              room.awareness,
              decoding.readVarUint8Array(decoder),
              ws
            );
            break;
          }
          default:
            break;
        }
      } catch (err) {
        console.error('Error processing Yjs WS message:', err);
      }
    });

    // Handle client disconnect
    ws.on('close', async () => {
      console.log(`🔌 Yjs WebSocket client disconnected from room: ${docName}`);
      room.clients.delete(ws);

      // Remove client awareness state
      awarenessProtocol.removeAwarenessStates(
        room.awareness,
        [room.doc.clientID],
        null
      );

      // If room is empty, save final state to DB and clean up room from memory
      if (room.clients.size === 0) {
        if (room.saveTimer) {
          clearTimeout(room.saveTimer);
          room.saveTimer = null;
        }
        await saveRoomToDB(docName, room);
        docs.delete(docName);
        console.log(`🧹 Cleaned up empty Yjs room: ${docName}`);
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error in room ${docName}:`, error);
    });
  });

  console.log('✅ Yjs WebSocket Server initialized alongside HTTP Server');
};

module.exports = { initYWebSocketServer };
