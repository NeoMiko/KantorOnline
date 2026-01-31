import { HandlerResponse, HandlerEvent } from "@netlify/functions";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  console.log("=== PING ENDPOINT ===");
  
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "pong",
      timestamp: new Date().toISOString(),
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeVersion: process.version,
      }
    }),
  };
};
