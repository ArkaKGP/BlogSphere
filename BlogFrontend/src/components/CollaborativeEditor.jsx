import React, { useEffect, useState, useMemo, useRef, Component } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, CodeXml, Undo, Redo, Wifi, WifiOff, Users, AlertCircle
} from 'lucide-react';

const CURSOR_COLORS = [
  '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#a855f7'
];

const getUserColor = (name) => {
  if (!name) return CURSOR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
};

class EditorErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CollaborativeEditor Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-[#141212] rounded-2xl border border-amber-500/30 text-center text-[#f5e6c8]">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-[#f5e6c8] text-lg font-bold mb-2">Editor Component Recovered</h3>
          <p className="text-[#9c9486] text-sm mb-4">
            {this.state.error?.message || 'A temporary rendering error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2.5 bg-[#18181a] border border-[#24221c] text-[#f5e6c8] text-sm font-semibold rounded-xl hover:border-[#c9a84c] transition-all"
          >
            Reload Editor Canvas
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

const InnerEditor = ({
  ydoc,
  provider,
  status,
  activeUsers,
  username,
  initialContent,
  onSave,
}) => {
  const userColor = useMemo(() => getUserColor(username), [username]);
  const hasSeededRef = useRef(false);

  const cleanInitialContent = useMemo(() => {
    return deduplicateHtmlContent(initialContent);
  }, [initialContent]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Yjs handles undo/redo for collaborative editing
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        awareness: provider.awareness,
        user: {
          name: username || 'Guest',
          color: userColor,
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none focus:outline-none min-h-[350px] p-6 text-[#f5e6c8] leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      if (onSave) {
        onSave(editor.getHTML());
      }
    },
  });

  // Seed initial content into Y.Doc ONLY if the document is genuinely empty AFTER Yjs WebSocket sync completes
  useEffect(() => {
    if (!editor || !provider || !cleanInitialContent) return;

    const performSeeding = () => {
      if (hasSeededRef.current) return;

      const xmlFragment = ydoc.getXmlFragment('default');
      const fragmentStr = xmlFragment.toString().trim();

      // Only seed if Yjs document is empty on both server and client
      const isEmpty = xmlFragment.length === 0 || !fragmentStr || fragmentStr === '<paragraph></paragraph>';

      if (isEmpty) {
        hasSeededRef.current = true;
        editor.commands.setContent(cleanInitialContent);
      } else {
        hasSeededRef.current = true;
      }
    };

    if (provider.synced) {
      performSeeding();
    } else {
      const handleSync = (isSynced) => {
        if (isSynced) {
          performSeeding();
        }
      };
      provider.on('sync', handleSync);
      return () => {
        provider.off('sync', handleSync);
      };
    }
  }, [editor, provider, cleanInitialContent, ydoc]);

  if (!editor) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#121214] rounded-2xl border border-[#24221c]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#24221c] border-t-[#c9a84c] mb-3"></div>
        <p className="text-[#9c9486] text-sm animate-pulse">Initializing rich text editor...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121214] rounded-2xl border border-[#24221c] overflow-hidden shadow-2xl">
      {/* Editor Header: Connection Status & Active Collaborators */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-[#161619] border-b border-[#24221c] gap-4">
        {/* Connection Status Badge */}
        <div className="flex items-center gap-2">
          {status === 'connected' ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Wifi className="w-3.5 h-3.5" />
              Live Sync Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <WifiOff className="w-3.5 h-3.5" />
              Connecting...
            </span>
          )}
        </div>

        {/* Active Collaborators Presence */}
        <div className="flex items-center gap-3">
          <div className="flex items-center text-[#9c9486] text-xs font-medium gap-1.5">
            <Users className="w-4 h-4 text-[#c9a84c]" />
            <span>Editing Now ({activeUsers.length}):</span>
          </div>
          <div className="flex items-center -space-x-2">
            {activeUsers.map((user, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer"
                title={`${user.name} ${user.name === username ? '(You)' : ''}`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-[#121214] transition-transform group-hover:scale-110"
                  style={{ backgroundColor: user.color || '#c9a84c' }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-[#0a0a0c] text-white text-xs px-2.5 py-1 rounded shadow-lg whitespace-nowrap border border-[#24221c] z-50">
                  {user.name} {user.name === username ? '(You)' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 bg-[#18181b] border-b border-[#24221c] text-[#f5e6c8]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('bold')
              ? 'bg-[#c9a84c] text-black font-bold'
              : 'hover:bg-[#24221c] text-[#f5e6c8]'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('italic')
              ? 'bg-[#c9a84c] text-black font-bold'
              : 'hover:bg-[#24221c] text-[#f5e6c8]'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('strike')
              ? 'bg-[#c9a84c] text-black font-bold'
              : 'hover:bg-[#24221c] text-[#f5e6c8]'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('code')
              ? 'bg-[#c9a84c] text-black font-bold'
              : 'hover:bg-[#24221c] text-[#f5e6c8]'
          }`}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[#24221c] mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-[#c9a84c] text-black font-bold'
              : 'hover:bg-[#24221c] text-[#f5e6c8]'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-[#c9a84c] text-black font-bold'
              : 'hover:bg-[#24221c] text-[#f5e6c8]'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-[#c9a84c] text-black font-bold'
              : 'hover:bg-[#24221c] text-[#f5e6c8]'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[#24221c] mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-[#c9a84c] text-black font-bold'
              : 'hover:bg-[#24221c] text-[#f5e6c8]'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-[#c9a84c] text-black font-bold'
              : 'hover:bg-[#24221c] text-[#f5e6c8]'
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-[#c9a84c] text-black font-bold'
              : 'hover:bg-[#24221c] text-[#f5e6c8]'
          }`}
          title="Code Block"
        >
          <CodeXml className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-[#c9a84c] text-black font-bold'
              : 'hover:bg-[#24221c] text-[#f5e6c8]'
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[#24221c] mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg hover:bg-[#24221c] text-[#f5e6c8] disabled:opacity-40 disabled:hover:bg-transparent"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg hover:bg-[#24221c] text-[#f5e6c8] disabled:opacity-40 disabled:hover:bg-transparent"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="p-4 bg-[#0a0a0c] min-h-[400px]">
        <EditorContent editor={editor} />
      </div>

      {/* Cursor Styles Injection */}
      <style>{`
        .collaboration-cursor__caret {
          border-left: 2px solid #0d0d0d;
          border-right: 2px solid #0d0d0d;
          margin-left: -1px;
          margin-right: -1px;
          pointer-events: none;
          position: relative;
          word-break: normal;
        }

        .collaboration-cursor__label {
          border-radius: 4px;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          left: -1px;
          line-height: normal;
          padding: 2px 6px;
          position: absolute;
          top: -1.6em;
          user-select: none;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          z-index: 10;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          color: #7c7569;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 800;
          color: #f5e6c8;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #c9a84c;
          margin-top: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #f5e6c8;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror blockquote {
          border-left: 3px solid #c9a84c;
          padding-left: 1rem;
          font-style: italic;
          color: #9c9486;
          margin: 1rem 0;
        }

        .ProseMirror pre {
          background-color: #18181b;
          border: 1px solid #24221c;
          border-radius: 0.5rem;
          padding: 1rem;
          font-family: monospace;
          color: #f5e6c8;
          overflow-x: auto;
        }

        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

const CollaborativeEditor = ({ blogId, username, initialContent, onSave }) => {
  const [provider, setProvider] = useState(null);
  const [ydoc, setYdoc] = useState(null);
  const [status, setStatus] = useState('connecting');
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    const doc = new Y.Doc();
    const backendBase =
      import.meta.env.VITE_BASE_URL ||
      import.meta.env.REACT_APP_BASE_URL ||
      'http://localhost:5000';
    
    // Normalize WS URL without trailing slashes
    const wsUrl = backendBase.replace(/\/+$/, '').replace(/^http/, 'ws');

    const wsProvider = new WebsocketProvider(wsUrl, blogId, doc);

    wsProvider.on('status', (event) => {
      setStatus(event.status);
    });

    wsProvider.awareness.on('change', () => {
      try {
        const states = Array.from(wsProvider.awareness.getStates().values());
        const users = states
          .filter((s) => s && s.user && s.user.name)
          .map((s) => s.user);

        const uniqueUsers = [];
        const seen = new Set();
        for (const u of users) {
          if (!seen.has(u.name)) {
            seen.add(u.name);
            uniqueUsers.push(u);
          }
        }
        setActiveUsers(uniqueUsers);
      } catch (err) {
        console.error('Error parsing awareness state:', err);
      }
    });

    setYdoc(doc);
    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
      doc.destroy();
    };
  }, [blogId]);

  if (!provider || !ydoc) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#121214] rounded-2xl border border-[#24221c]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#24221c] border-t-[#c9a84c] mb-4"></div>
        <p className="text-[#9c9486] font-medium animate-pulse">
          Connecting to live collaboration server...
        </p>
      </div>
    );
  }

  return (
    <EditorErrorBoundary>
      <InnerEditor
        ydoc={ydoc}
        provider={provider}
        status={status}
        activeUsers={activeUsers}
        username={username}
        initialContent={initialContent}
        onSave={onSave}
      />
    </EditorErrorBoundary>
  );
};

export default CollaborativeEditor;
