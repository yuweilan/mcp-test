"use client"

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";


interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "bot", text: "你好，有什么可以帮助你的吗？" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: input.trim()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // 模拟机器人回复
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        sender: "bot",
        text: "这是自动回复的信息。"
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 h-screen">
      <Card className="flex-1 p-4">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start ${message.sender === "bot" ? "justify-start" : "justify-end"}`}
              >
                {message.sender === "bot" && (
                  <Avatar className="mr-2">
                    <AvatarImage src="/bot-avatar.png" alt="Bot" />
                    <AvatarFallback>Bot</AvatarFallback>
                  </Avatar>
                )}
                <Card className="p-2 max-w-xs">
                  <p>{message.text}</p>
                </Card>
                {message.sender === "user" && (
                  <Avatar className="ml-2">
                    <AvatarImage src="/user-avatar.png" alt="User" />
                    <AvatarFallback>User</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
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
        />
        <Button onClick={handleSend}>发送</Button>
      </div>
    </div>
  );
}