"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TemperatureChart from "./temperature-chart";
import TemperatureReading from "./temperature-reading";
import TemperatureAlert from "./temperature-alert";
import HeaderMonitoring from "./header";
import AssistantAI from "./assistant-ai";
import { useMQTT } from "@/hooks/mqtt-context";
import { tempSettings } from "@/lib/utils";

export default function TemperatureMonitor() {
  const {
    temperature: mqttTemperature,
    humidity: mqttHumidity,
    connectionStatus,
    mqttConnect,
  } = useMQTT();

  // Inisialisasi MQTT connection
  useEffect(() => {
    mqttConnect(`wss://${process.env.NEXT_PUBLIC_MQTT_URL}:8084/mqtt`, {
      clientId: `mqtt_client_${Math.random().toString(16).substring(2, 8)}`,
      clean: true,
      username: process.env.NEXT_PUBLIC_MQTT_USER,
      password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });
  }, []);

  const getTemperatureStatus = (temp: number) => {
    if (temp < tempSettings.min)
      return {
        status: "low",
        color: "text-blue-600 dark:text-blue-400",
        bg: "temp-low",
      };
    if (temp > tempSettings.max)
      return {
        status: "high",
        color: "text-red-600 dark:text-red-400",
        bg: "temp-high",
      };
    return {
      status: "normal",
      color: "text-green-600 dark:text-green-400",
      bg: "temp-normal",
    };
  };

  // Ubah fallback suhu menjadi 27.4 di sini
  const tempStatus = getTemperatureStatus(mqttTemperature || 27.4);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div
          className={`${
            connectionStatus === "connected"
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          } p-2 rounded-md mb-2 text-sm flex items-center justify-center`}
        >
          <span className="font-medium">
            {connectionStatus === "connected"
              ? "MQTT Terhubung"
              : "MQTT Terputus"}
          </span>
        </div>

        <HeaderMonitoring isConnected={connectionStatus === "connected"} />

        {/* Alerts NOTIFICATION */}
        {tempStatus.status !== "normal" && <TemperatureAlert />}

        {/* Sensor Selection and Current Reading */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TemperatureReading
            currentSensor={{
              name: "Rumah",
              // Ubah fallback suhu (27.4) dan kelembaban (60) di sini agar UI tidak tampil 0
              currentTemp: mqttTemperature || 27.4,
              humidity: mqttHumidity || 60,
              lightStatus: true,
            }}
            tempStatus={tempStatus}
            mqttStatus={connectionStatus === "connected"}
          />

          <TemperatureChart />
        </div>

        {/* Assistant AI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Assistant AI</CardTitle>
          </CardHeader>
          <CardContent>
            <AssistantAI />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}