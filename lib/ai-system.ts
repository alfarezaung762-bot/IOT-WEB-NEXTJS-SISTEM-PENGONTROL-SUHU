// @ts-nocheck
import { db } from "@/db/db";
import { desc } from "drizzle-orm";
import { tool } from "ai";
import { z } from "zod";
import { sensorData } from "@/db/schema";

export const roasting_system = `
You are an assistant for an IoT project. You must always respond in Indonesian (Bahasa Indonesia).
KONDISI_SUHU_DALAM_RUMAH TOOL:
- Use only the \`kondisi_suhu_dalam_rumah\` tool to check temperature and humidity “dalam rumah.”
SWITCH TOOL INSTRUCTIONS:
- Available switch tools:
  • \`switch_tool_kipas\`: controls the fan on port 1.   
  • \`switch_tool\`: controls relay port 2.   
  • \`switch_tool_lampu_dalam_rumah\`: controls indoor light on port 3.   
  • \`switch_tool_semua_ruangan\`: controls ports 3 and 4 together.   
PORT MAPPINGS:
- Port 1 → kipas  
- Port 2 → relay port 2  
- Port 3 → lampu dalam rumah  
- Port 4 → semua ruangan
IMPORTANT: All responses must be in Indonesian only.
`;

export const weather_tool = tool({
  description: "Get the weather, temperature and humidity in a location",
  parameters: z.object({
    location: z.string().describe("The location to get the weather information for"),
    unit: z.enum(["celsius", "fahrenheit"]).optional(),
  }),
  execute: async ({ location, unit = "celsius" }) => {
    const tempCelsius = 15 + Math.floor(Math.random() * 20);
    return {
      location,
      temperature: unit === "celsius" ? tempCelsius : Math.round((tempCelsius * 9) / 5 + 32),
      unit: unit === "celsius" ? "°C" : "°F",
      humidity: 60,
      condition: "sunny",
      timestamp: new Date().toISOString(),
    };
  },
});

export const switch_tool_kipas = tool({
  description: "Turn on or off IoT fan connected to a specific port",
  parameters: z.object({
    port: z.string().describe("Port number, e.g. '1'"),
    action: z.enum(["on", "off"]),
  }),
  execute: async ({ port, action }) => ({ port, action, current_state: action }),
});

export const switch_tool = tool({
  description: "Turn on or off relay port 2",
  parameters: z.object({
    action: z.enum(["on", "off"]),
  }),
  execute: async ({ action }) => ({ port: "port 2", action, current_state: action }),
});

export const switch_tool_lampu_dalam_rumah = tool({
  description: "Turn on or off indoor lights",
  parameters: z.object({
    device: z.string(),
    location: z.string(),
    action: z.enum(["on", "off"]),
  }),
  execute: async ({ device, location, action }) => ({ device, location, action, current_state: action }),
});

export const switch_tool_semua_ruangan = tool({
  description: "Turn on or off ports 3 and 4",
  parameters: z.object({
    action: z.enum(["on", "off"]),
  }),
  execute: async ({ action }) => ({ ports: ["port 3", "port 4"], action, current_state: action }),
});

export const kondisi_suhu_dalam_rumah = tool({
  description: "Get the current temperature and humidity inside the house",
  parameters: z.object({}), 
  execute: async () => {
    const latestReading = await db
      .select()
      .from(sensorData)
      .orderBy(desc(sensorData.timestamp))
      .limit(1);

    if (!latestReading || latestReading.length === 0) {
      return { error: "Data sensor tidak ditemukan", location: "dalam rumah" };
    }

    return {
      temperature: latestReading[0].temperature,
      humidity: latestReading[0].humidity,
      location: "dalam rumah",
    };
  },
});