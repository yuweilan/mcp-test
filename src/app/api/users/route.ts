/*
 * @Author: yunzhen.yyz
 * @Date: 2025-07-02 16:25:40
 * @LastEditors: yunzhen.yyz
 * @LastEditTime: 2025-07-02 16:27:09
 * @Description: file content
 * @FilePath: /mcp-test/src/app/api/users/route.ts
 */
export async function GET() {
  // For example, fetch data from your DB here
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
  return new Response(JSON.stringify(users), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
 
export async function POST(request: Request) {
  // Parse the request body
  const body = await request.json();
  const { name } = body;
 
  // e.g. Insert new user into your DB
  const newUser = { id: Date.now(), name };
 
  return new Response(JSON.stringify(newUser), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}