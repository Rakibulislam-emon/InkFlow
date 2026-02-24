"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PracticeCanvasProps {
  className?: string;
  onDraw?: () => void;
}

export function PracticeCanvas({ className, onDraw }: PracticeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle resizing and scale
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const { width, height } = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const context = canvas.getContext("2d");
      if (context) {
        context.scale(dpr, dpr);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = "#6366f1"; // indigo-500
        context.lineWidth = 3;
        setCtx(context);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      setIsDrawing(true);

      if (!ctx || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x =
        "touches" in e
          ? e.touches[0].clientX - rect.left
          : e.clientX - rect.left;
      const y =
        "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(x, y);
    },
    [ctx],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || !ctx || !canvasRef.current) return;
      e.stopPropagation();

      const rect = canvasRef.current.getBoundingClientRect();
      const x =
        "touches" in e
          ? e.touches[0].clientX - rect.left
          : e.clientX - rect.left;
      const y =
        "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();

      if (onDraw) onDraw();
    },
    [isDrawing, ctx, onDraw],
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    if (ctx) ctx.closePath();
  }, [ctx]);

  const clearCanvas = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className={cn("relative w-full h-full", className)}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="absolute inset-0 z-20 touch-none cursor-crosshair"
      />

      <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={clearCanvas}
          title="Clear Practice"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
