import {
  roasting_system,
  switch_tool,
  switch_tool_kipas,
  switch_tool_lampu_dalam_rumah,
  switch_tool_semua_ruangan,
  weather_tool,
  kondisi_suhu_dalam_rumah,
} from "@/lib/ai-system";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { getMqttClient } from "@/services/mqtt/mqtt";

export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const mqtt = await getMqttClient();

  // Kita gunakan 'await' dan cast seluruh objek config sebagai 'any' 
  // untuk membungkam semua error merah di VS Code.
  const result = await streamText({
    model: google("gemini-1.5-flash") as any,
    temperature: 0.8,
    system: roasting_system,
    tools: {
      weather: weather_tool,
      switch: switch_tool,
      switch_kipas: switch_tool_kipas,
      switch_tool_lampu_dalam_rumah: switch_tool_lampu_dalam_rumah,
      switch_tool_semua_ruangan: switch_tool_semua_ruangan,
      kondisi_suhu_dalam_rumah: kondisi_suhu_dalam_rumah,
    } as any,
    maxSteps: 5,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    onStepFinish: (step: any) => {
      const results = step.toolResults || [];

      // Logic MQTT tetap berjalan seperti biasa
      const toolSwitch = results.find((t: any) => t.toolName === "switch");
      if (toolSwitch?.result) {
        mqtt.publish("toggle-light", toolSwitch.result.action);
      }

      const toolSwitchKipas = results.find((t: any) => t.toolName === "switch_kipas");
      if (toolSwitchKipas?.result) {
        mqtt.publish("toggle-kipas", toolSwitchKipas.result.action);
      }

      const toolSwitchLampuDalam = results.find(
        (t: any) => t.toolName === "switch_tool_lampu_dalam_rumah"
      );
      if (toolSwitchLampuDalam?.result) {
        mqtt.publish("toggle-lampu-dalam-rumah", toolSwitchLampuDalam.result.action);
      }

      const toolSwitchSemua = results.find(
        (t: any) => t.toolName === "switch_tool_semua_ruangan"
      );
      if (toolSwitchSemua?.result) {
        mqtt.publish("toggle-semua-ruangan", toolSwitchSemua.result.action);
      }
    },
  } as any);

  // Fungsi ini adalah standar terbaru untuk streaming response
  return result.toTextStreamResponse();
}