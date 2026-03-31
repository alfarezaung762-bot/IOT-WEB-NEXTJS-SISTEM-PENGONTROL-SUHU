/* eslint-disable @typescript-eslint/no-explicit-any */gi
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Video, Volume2, VolumeX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function TemperatureChart() {
  const playerRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Fungsi untuk inisialisasi YouTube Player API
    const initPlayer = () => {
      if (!playerRef.current && (window as any).YT) {
        playerRef.current = new (window as any).YT.Player("youtube-player", {
          videoId: "NjsAwUop8Go",
          playerVars: {
            autoplay: 1,
            controls: 0,
            loop: 1,
            playlist: "NjsAwUop8Go",
            mute: 1,
            rel: 0,
            modestbranding: 1,
            disablekb: 1,
          },
          events: {
            onReady: (event: any) => {
              setIsReady(true);
              event.target.playVideo();
            },
          },
        });
      }
    };

    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    
    if (playerRef.current && isReady) {
      if (val > 0) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
      playerRef.current.setVolume(val);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current || !isReady) return;
    
    if (isMuted) {
      playerRef.current.unMute();
      const newVol = volume === 0 ? 50 : volume;
      playerRef.current.setVolume(newVol);
      setVolume(newVol);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <Card className="lg:col-span-2 shadow-sm border-gray-200 dark:border-gray-800 relative overflow-hidden">
      
      {/* HEADER SECTION */}
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Live Monitor: Smart Miniatur Stopkontak & Sensor Suhu
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Pantauan Real-time Perangkat IoT & Aktivitas Sensor Dalam Rumah
            </CardDescription>
          </div>
          
          {/* Top-right Audio Badge (Optional) */}
          <div className="hidden sm:flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/50">
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-gray-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-blue-500 animate-pulse" />
            )}
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {isMuted ? "Audio Off" : "Audio On"}
            </span>
          </div>
        </div>
      </CardHeader>
      
      {/* CONTENT SECTION (Video + Overlay Audio Control) */}
      <CardContent className="p-0 sm:p-6 flex justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        
        {/* WADAH UTAMA VIDEO & OVERLAY */}
        <div className="relative w-full max-w-4xl rounded-none sm:rounded-2xl overflow-hidden shadow-2xl bg-black flex flex-col items-center">
          
          {/* BADGE LIVE FEED (Kiri Atas) */}
          <div className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md flex items-center gap-2 border border-white/10 shadow-lg">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
             LIVE FEED
          </div>

          {/* AREA VIDEO (Maksimal tinggi agar proporsional) */}
          <div className="relative w-full max-w-[400px] sm:max-w-[500px] aspect-[9/16] pointer-events-none mx-auto">
             {/* scale-[1.25] memotong border hitam YouTube */}
             <div id="youtube-player" className="absolute top-0 left-0 w-full h-full scale-[1.25] origin-center"></div>
          </div>

          {/* OVERLAY AUDIO CONTROL (Melayang di bawah video) */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[350px] z-20">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 p-4 sm:p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-4 transition-all duration-300 hover:bg-white/95 dark:hover:bg-gray-900/95">
              
              <div className="w-full flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Audio Control</span>
                {!isReady && <span className="text-[10px] text-gray-500 animate-pulse">Menyiapkan...</span>}
              </div>
              
              <div className="w-full flex items-center gap-4">
                {/* Tombol Mute Bulat Besar */}
                <button 
                  onClick={toggleMute}
                  disabled={!isReady}
                  className={`flex-shrink-0 w-12 h-12 flex justify-center items-center rounded-full transition-all duration-300 ${
                    isMuted 
                      ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200" 
                      : "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shadow-lg hover:bg-blue-200"
                  }`}
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 animate-pulse" />}
                </button>

                {/* Slider Volume */}
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-6 text-right">0%</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume} 
                    onChange={handleVolumeChange}
                    disabled={!isReady}
                    className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8 text-left">{volume}%</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </CardContent>
      
      {/* FOOTER SECTION */}
      <CardFooter className="border-t bg-white dark:bg-[#0a0a0a] py-4">
        <div className="flex w-full items-center justify-between text-sm">
          <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
            <Video className="h-4 w-4 text-blue-500" />
            Monitoring Visual IoT
          </div>
          <div className="text-gray-500 italic text-xs flex items-center gap-2">
            Sinkronisasi video aktif
            {/* Contoh status data kecil di kanan bawah */}
            <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">
              OK
            </span>
          </div>
        </div>
      </CardFooter>
      
    </Card>
  );
}