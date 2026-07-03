import { useEffect, useRef, useState } from "react";
import { Globe, History, Loader2 } from "lucide-react";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import { translate } from "./services/ai";
import { trackTranslate } from "./lib/analytics";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const lastClipboard = useRef("");
  const isEditing = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function addToHistory(value: string) {
    const cleanValue = value.trim();
    if (!cleanValue) return;

    setHistory((prev) => {
      const next = [cleanValue, ...prev.filter((item) => item !== cleanValue)];
      return next.slice(0, 5);
    });
  }

  useEffect(() => {
    async function watchClipboard() {
      try {
        const clipboard = await readText();

        if (clipboard && clipboard !== lastClipboard.current) {
          lastClipboard.current = clipboard;
          addToHistory(clipboard);

          if (!isEditing.current && !isTranslating) {
            setText(clipboard);
          }
        }
      } catch (err) {
        console.error("Clipboard read failed:", err);
      }
    }

    watchClipboard();

    const timer = window.setInterval(watchClipboard, 800);

    return () => {
      window.clearInterval(timer);
    };
  }, [isTranslating]);

  async function handleTranslate() {
    const sourceText = text.trim();
    if (!sourceText || isTranslating) return;

    try {
      setIsTranslating(true);

      const result = await translate(sourceText);

      setText(result);
      lastClipboard.current = result;

      await trackTranslate(sourceText);

      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 0);
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setIsTranslating(false);
    }
  }

  function selectHistoryItem(item: string) {
    setText(item);
    lastClipboard.current = item;
    setShowHistory(false);

    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
  }

  return (
    <main className="app">
      <textarea
        ref={textareaRef}
        className="editor"
        placeholder="Paste or type anything..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => {
          isEditing.current = true;
        }}
        onBlur={() => {
          isEditing.current = false;
        }}
        autoFocus
      />

      <div className="toolbar">
        <button
          className="icon"
          title="Translate"
          onClick={handleTranslate}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <Loader2 size={22} strokeWidth={1.8} />
          ) : (
            <Globe size={22} strokeWidth={1.8} />
          )}
        </button>

        <button
          className="icon"
          title="History"
          onClick={() => setShowHistory((value) => !value)}
        >
          <History size={22} strokeWidth={1.8} />
        </button>
      </div>

      {showHistory && (
        <div className="history-panel">
          {history.length === 0 ? (
            <div className="history-empty">No history yet</div>
          ) : (
            history.map((item, index) => (
              <button
                key={`${item}-${index}`}
                className="history-item"
                onClick={() => selectHistoryItem(item)}
              >
                {item}
              </button>
            ))
          )}
        </div>
      )}

      <div className="resize-hint">///</div>
    </main>
  );
}

export default App;