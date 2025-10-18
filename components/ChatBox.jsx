"use client";
import { useState } from "react";
import { Input, Button, Card } from "antd";
import axios from "axios";

export default function ChatBox({ context }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const res = await axios.post("/api/chat", { query: input, context });
    setMessages([...messages, { q: input, a: res.data.answer }]);
    setInput("");
  };

  return (
    <Card className="glass p-6 mt-6">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i}>
            <p className="font-bold">You: {m.q}</p>
            <p className="text-green-400">AI: {m.a}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask something..." />
        <Button type="primary" onClick={sendMessage}>Send</Button>
      </div>
    </Card>
  );
}
