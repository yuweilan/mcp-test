/*
 * @Author: yunzhen.yyz
 * @Date: 2025-07-02 16:23:16
 * @LastEditors: yunzhen.yyz
 * @LastEditTime: 2025-07-23 15:13:44
 * @Description: file content
 * @FilePath: /mcp-test/src/app/api/mcp/route.ts
 */
// app/api/chat/route.js
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, model, temperature } = await request.json();
    // 连接到本地运行的Ollama
    const ollamaResponse = await fetch('http://192.168.124.246:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'deepseek-r1:7b',
        messages: [{ role: 'user', content: message }],
        stream: true,
        options: {
          temperature: temperature || 0.7,
        }
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.status}`);
    }

    // 创建可读流
    const stream = new ReadableStream({
      async start(controller) {
        if (!ollamaResponse.body) {
          throw new Error('Response body is null');
        }
        const reader = ollamaResponse.body.getReader();
        const decoder = new TextDecoder();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            console.info('Received chunk:', chunk);
            controller.enqueue(value);
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      }
    });

    // 返回流式响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';