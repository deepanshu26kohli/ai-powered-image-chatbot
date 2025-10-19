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
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Glass Glow Effect Background */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-pink-500/40 to-purple-500/40 rounded-full blur-3xl opacity-30 top-10 left-10 animate-pulse"></div>
      <div className="absolute w-[400px] h-[400px] bg-gradient-to-r from-blue-500/40 to-cyan-400/40 rounded-full blur-3xl opacity-20 bottom-10 right-10 animate-pulse"></div>

      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col relative z-10">
        <h1 className="text-3xl font-bold text-center text-white mb-2 drop-shadow-md">
          🤖 AI Powered Image Chatbot
        </h1>
        <p className="text-sm text-center text-white/70 mb-6">
          Upload an image to extract content and chat intelligently with its context.
        </p>

        <Upload beforeUpload={handleFileSelect} showUploadList={false}>
          <Button
            icon={<UploadOutlined />}
            className="w-full mb-3 bg-white/20 hover:bg-white/30 text-white border-none flex items-center justify-center backdrop-blur-md rounded-xl transition-all duration-300"
          >
            Select Image
          </Button>
        </Upload>

        {preview && (
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <img
                src={preview}
                alt="preview"
                className="max-h-48 rounded-2xl border border-white/30 object-contain shadow-lg"
              />
              <div className="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition-all">
                Image Preview
              </div>
            </div>
          </div>
        )}

        {!!file && (
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={!file}
            className="w-full mb-6 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
          >
            Extract & Analyze
          </Button>
        )}

        <div className="flex-1 overflow-y-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 h-64 flex flex-col border border-white/20 shadow-inner">
          {chat.length === 0 && !loading && (
            <p className="text-white/50 text-center my-auto">No conversation yet...</p>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <span
                className={`inline-block px-4 py-2 rounded-2xl max-w-xs break-words backdrop-blur-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-purple-600/50 to-pink-500/50 text-white shadow-md"
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
          className="bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none backdrop-blur-md shadow-inner"
        />
      </div>
    </div>
  );
}
