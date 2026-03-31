import {
  roasting_system,
  switch_tool,
  switch_tool_kipas,
  switch_tool_lampu_dalam_rumah,
  switch_tool_semua_ruangan,
  weather_tool,
  kondisi_suhu_dalam_rumah,
} from "@/lib/ai-system";
import { convertToCoreMessages, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { getMqttClient } from "@/services/mqtt/mqtt";

// TAMBAHKAN BARIS INI: Memaksa API ini berjalan secara dinamis saat runtime, bukan saat build time.
export const dynamic = "force-dynamic";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export const runtime = "nodejs"; // eksplisit agar tidak pindah ke Edge

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const mqtt = await getMqttClient();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    temperature: 0.8,
    system: roasting_system,
    tools: {
      weather: weather_tool,
      // roasting: roasting_tool,
      switch: switch_tool,
      switch_kipas: switch_tool_kipas,
      switch_tool_lampu_dalam_rumah: switch_tool_lampu_dalam_rumah,
      switch_tool_semua_ruangan: switch_tool_semua_ruangan,
      kondisi_suhu_dalam_rumah: kondisi_suhu_dalam_rumah,
    },
    maxSteps: 5,
    // messages: body.messages,
    messages: convertToCoreMessages([
      {
        role: "user",
        content: prompt,
      },
    ]),

    onStepFinish: (step) => {
      // console.log(JSON.stringify(step.toolResults, null, 2));

      // RELAY 2 (PORT 2)
      const toolSwitch = step.toolResults.find(
        (tool) => tool.toolName === "switch"
      );
      if (toolSwitch) {
        const result_action = toolSwitch.result.action;
        mqtt.publish("toggle-light", result_action);
      }

      const toolSwitchKipas = step.toolResults.find(
        (tool) => tool.toolName === "switch_kipas"
      );
      if (toolSwitchKipas) {
        const result_action = toolSwitchKipas.result.action;
        mqtt.publish("toggle-kipas", result_action);
      }

      const toolSwitchLampuDalamRuangan = step.toolResults.find(
        (tool) => tool.toolName === "switch_tool_lampu_dalam_rumah"
      );

      if (toolSwitchLampuDalamRuangan) {
        const result_action = toolSwitchLampuDalamRuangan.result.action;
        mqtt.publish("toggle-lampu-dalam-rumah", result_action);
      }

      const toolSwitchSemuaRuangan = step.toolResults.find(
        (tool) => tool.toolName === "switch_tool_semua_ruangan"
      );

      if (toolSwitchSemuaRuangan) {
        const result_action = toolSwitchSemuaRuangan.result.action;
        mqtt.publish("toggle-semua-ruangan", result_action);
      }

      const toolKondisiSuhuDalamRumah = step.toolResults.find(
        (tool) => tool.toolName === "kondisi_suhu_dalam_rumah"
      );

      if (toolKondisiSuhuDalamRumah) {
        console.log(
          toolKondisiSuhuDalamRumah.result,
          "toolKondisiSuhuDalamRumah"
        );
      }
    },
  });

  const streamYow = result.toDataStreamResponse();

  return streamYow;
}