import { NextResponse } from 'next/server';
import WebSocket from 'ws';
 
export const dynamic = 'force-dynamic';
 
export async function GET() {
 const vessels = await new Promise<object[]>((resolve) => {
   const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
   const data: object[] = [];
   ws.on('open', () => {
     ws.send(JSON.stringify({
       APIKey: process.env.AISSTREAM_API_KEY,
       BoundingBoxes: [[[50, 10], [80, 30]]],
       FilterMessageTypes: ['PositionReport'],
     }));
     setTimeout(() => { ws.close(); resolve(data); }, 8_000);
   });
   ws.on('message', (d: Buffer) => { try { data.push(JSON.parse(d.toString())); } catch {} });
   ws.on('error', () => resolve(data));
 });
 return NextResponse.json(vessels);
}
