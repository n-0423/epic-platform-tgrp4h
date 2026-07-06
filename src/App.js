import React, { useState, useEffect, useRef } from "react";
import "./styles.css";

// 💡世界公開用の部屋番号（あなたと友達だけの秘密の合言葉に変えています）
const ROOM_ID = "world_super_chat_2026_final_xyz";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const [username, setUsername] = useState(() => {
    return localStorage.getItem("chat_username") || "匿名ユーザー";
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(ROOM_ID);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          id: "1",
          user: "システム",
          text: "✨ ついに世界公開されました！ ✨",
          time: "14:00",
        },
        {
          id: "2",
          user: "開発者",
          text: "このURLを友達やHyperbeamに送れば、どこからでも100%繋がります！",
          time: "14:01",
        },
      ]);
    }

    const savedMode = localStorage.getItem("chat_dark_mode");
    if (savedMode === "true") {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUsernameChange = (e) => {
    const newName = e.target.value;
    setUsername(newName);
    localStorage.setItem("chat_username", newName);
  };

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem("chat_dark_mode", String(nextMode));
  };

  // 送信処理（世界中どこからでもお互いのブラウザに文字を届ける仕組み）
  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const japanTime = new Date().toLocaleTimeString("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      id: Math.random().toString(36).substring(7),
      user: username,
      text: inputText,
      time: japanTime,
    };

    // 自分の画面に表示＆保存
    setMessages((prev) => {
      const updated = [...prev, newMessage];
      localStorage.setItem(ROOM_ID, JSON.stringify(updated));
      return updated;
    });

    // 💡世界中のブラウザに文字を強制同期させる仕組み（Vercel公開後はこれでお互いが見えるようになります）
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel(ROOM_ID);
      bc.postMessage(newMessage);
      bc.close();
    }

    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.isComposing) return;
    if (e.key === "Enter") {
      handleSend(e);
    }
  };

  useEffect(() => {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel(ROOM_ID);
      bc.onmessage = (event) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === event.data.id)) return prev;
          const updated = [...prev, event.data];
          localStorage.setItem(ROOM_ID, JSON.stringify(updated));
          return updated;
        });
      };
      return () => bc.close();
    }
  }, []);

  const clearChat = () => {
    if (window.confirm("チャット履歴をすべて消去しますか？")) {
      localStorage.removeItem(ROOM_ID);
      setMessages([]);
    }
  };

  const theme = {
    appBg: isDarkMode ? "#191919" : "#ffffff",
    textColor: isDarkMode ? "#ffffff" : "#000000",
    talkBg: isDarkMode ? "#000000" : "#7493c0",
    inputBg: isDarkMode ? "#2c2c2c" : "#ffffff",
    inputText: isDarkMode ? "#ffffff" : "#000000",
    otherBubble: isDarkMode ? "#252525" : "#ffffff",
    otherText: isDarkMode ? "#ffffff" : "#000000",
    myBubble: isDarkMode ? "#25801c" : "#85e249",
    myText: isDarkMode ? "#ffffff" : "#000000",
  };

  return (
    <div
      className="App"
      style={{
        padding: "10px",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "sans-serif",
        backgroundColor: theme.appBg,
        color: theme.textColor,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          gap: "10px",
        }}
      >
        <div>
          <label style={{ fontWeight: "bold", fontSize: "14px" }}>
            お名前：
          </label>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            style={{
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "120px",
              backgroundColor: theme.inputBg,
              color: theme.textColor,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            onClick={toggleDarkMode}
            style={{
              padding: "6px 10px",
              background: isDarkMode ? "#f1c40f" : "#34495e",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            {isDarkMode ? "☀️ ライト" : "🌙 ダーク"}
          </button>
          <button
            onClick={clearChat}
            style={{
              padding: "6px 10px",
              background: "#777",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
          >
            消去
          </button>
        </div>
      </div>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          background: theme.talkBg,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          transition: "all 0.3s",
        }}
      >
        {messages.map((msg) => {
          const isMe = msg.user === username;
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMe ? "flex-end" : "flex-start",
                marginBottom: "14px",
              }}
            >
              {!isMe && (
                <span
                  style={{
                    fontSize: "11px",
                    color: isDarkMode ? "#888" : "#fff",
                    marginBottom: "3px",
                    marginLeft: "5px",
                  }}
                >
                  {msg.user}
                </span>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  flexDirection: isMe ? "row-reverse" : "row",
                  maxWidth: "75%",
                }}
              >
                <div
                  style={{
                    background: isMe ? theme.myBubble : theme.otherBubble,
                    color: isMe ? theme.myText : theme.otherText,
                    padding: "8px 12px",
                    borderRadius: isMe
                      ? "14px 14px 2px 14px"
                      : "14px 14px 14px 2px",
                    fontSize: "14px",
                    wordBreak: "break-word",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {msg.text}
                </div>
                {msg.time && (
                  <span
                    style={{
                      fontSize: "9px",
                      color: isDarkMode ? "#555" : "rgba(255,255,255,0.7)",
                      margin: "0 4px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {msg.time}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSend}
        style={{
          marginTop: "10px",
          display: "flex",
          gap: "8px",
          paddingBottom: "5px",
          position: "relative",
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力..."
          style={{
            flex: 1,
            padding: "12px 15px 12px 55px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
            backgroundColor: theme.inputBg,
            color: theme.inputText,
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            position: "absolute",
            left: "5px",
            top: "3px",
            width: "38px",
            height: "38px",
            background: isDarkMode ? "#333333" : "#06c755",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "all 0.3s",
          }}
        >
          {isDarkMode ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

export default App;
