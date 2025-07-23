"use client"

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", content: "你好，有什么可以帮助你的吗？" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSend = async () => {
    if (!input.trim()) return;
    const messageId = messages.length + 1;
    setMessages((msgs) => [...msgs, { id: messageId, role: 'user', content: input }]);
    setLoading(true);
    let aiContent = '';
    setMessages((msgs) => [...msgs, { id: messageId + 1, role: 'assistant', content: '' }]);
    console.log("Sending message:", input);
    // 使用 EventSource 兼容 SSE
    const response = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });
    console.info(22222, response);
    if (!!response?.body) {
      const reader = response?.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n');
          buffer = parts.pop() ?? '';
          for (const part of parts) {
            try {
              const data: {
                message: {
                  content?: string
                }
              } = JSON.parse(part || '{}');
              console.info('Parsed data:', data, data?.message, data?.message?.content);
              const mes = data?.message?.content;
              if (mes) {
                aiContent += mes;
                // aiContent += mes.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\"/g, '"');
                console.info('Updated AI content:', aiContent);
                setMessages((msgs) => {
                  const updated = [...msgs];
                  updated[updated.length - 1] = { id: messageId + 1, role: 'assistant', content: aiContent };
                  return updated;
                });
              }
            } catch {
              console.error('Error parsing JSON:', part);
            }

          }
        }
      }
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col p-4 space-y-4 h-screen">
      <Card className="flex-1 p-4">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="mr-2">
                    <AvatarImage src="/bot-avatar.png" alt="Bot" />
                    <AvatarFallback>Bot</AvatarFallback>
                  </Avatar>
                )}
                <Card className="p-2">
                  <p dangerouslySetInnerHTML={{ __html: message.content }}></p>
                </Card>
                {message.role === "user" && (
                  <Avatar className="ml-2">
                    <AvatarImage src="/user-avatar.png" alt="User" />
                    <AvatarFallback>User</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
          {loading && <div style={{ color: '#aaa' }}>AI 正在思考...</div>}
        </ScrollArea>
      </Card>
      <div className="flex space-x-2 h-1/6">
        <Input
          className="flex-1"
          placeholder="输入你的问题"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          disabled={loading}
        />
        <Button disabled={loading || !input.trim()} onClick={handleSend}>发送</Button>
      </div>
    </div>
  );
}