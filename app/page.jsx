"use client";
import { useState, useRef, useEffect } from "react";
import { Upload, Button, Input, Spin } from "antd";
import { UploadOutlined, SendOutlined } from "@ant-design/icons";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    setSessionId(data.sessionId);
    setOcrText(data.ocrText);
    setChat([{ role: "system", text: "Context loaded. You can now ask questions about the image." }]);
    setLoading(false);
  };

  const handleChat = async () => {
    if (!input || !sessionId) return;

    const userMsg = { role: "user", text: input };
    setChat(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: input }),
    });
    const data = await res.json();
    setChat(prev => [...prev, { role: "assistant", text: data.reply }]);
    setLoading(false);
  };

  const handleFileSelect = (file) => {
    setFile(file);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
    return false; // prevent auto upload
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl flex flex-col">
        <h1 className="text-2xl font-bold text-center text-white mb-4">🤖 AI Powered Image Chatbot</h1>
        <h5 className="text-md font-bold text-center text-white mb-4">Upload an image to get started. Then ask questions about it!</h5>

        <Upload
          beforeUpload={handleFileSelect}
          showUploadList={false}
        >
          <Button
            icon={<UploadOutlined />}
            className="w-full mb-3 bg-white/20 hover:bg-white/30 text-white border-none flex items-center justify-center"
          >
            Select Image
          </Button>
        </Upload>

        {preview && (
          <div className="flex justify-center mb-4">
            <img src={preview} alt="preview" className="max-h-48 rounded-xl border border-white/20 object-contain" />
          </div>
        )}
       {
        !!file && 
       
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={!file}
          className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
        >
          Extract & Analyze
        </Button>
}
        <div className="flex-1 overflow-y-auto bg-white/5 rounded-xl p-4 mb-4 h-64 flex flex-col">
          {chat.length === 0 && !loading && (
            <p className="text-white/50 text-center">No conversation yet...</p>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <span
                className={`inline-block px-4 py-2 rounded-xl max-w-xs break-words ${
                  msg.role === "user"
                    ? "bg-purple-500/30 text-white"
                    : "bg-white/20 text-white"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex justify-center mt-auto">
              <Spin size="small" className="text-white" />
            </div>
          )}

          {/* Auto scroll anchor */}
          <div ref={chatEndRef}></div>
        </div>

        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about the image..."
          onPressEnter={handleChat}
          suffix={
            <SendOutlined
              onClick={handleChat}
              className="text-white cursor-pointer hover:text-purple-300 transition-colors"
            />
          }
          className="bg-white/10 text-white placeholder-white/60 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400"
        />
      </div>
    </div>
  );
}
