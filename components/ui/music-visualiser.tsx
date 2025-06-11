"use client"
import React, { useState, useEffect } from "react";

const MusicVisualizer = () => {
  const [heights, setHeights] = useState<number[]>([]);
  
  useEffect(() => {
    // Initialize bar heights
    const initialHeights = Array.from({ length: 40 }, () => Math.random() * 50 + 15);
    setHeights(initialHeights);
    
    // Simulate audio activity with changing heights
    const interval = setInterval(() => {
      setHeights(prev => 
        prev.map(() => Math.random() * 50 + 15)
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const bars = Array.from({ length: 40 }, (_, i) => (
    <div 
      key={i} 
      className={`visualizer-bar animate-wave-${(i % 5) + 1}`}
      style={{ 
        height: `${heights[i] || 30}%`, 
        animationDelay: `${i * 0.05}s` 
      }}
    ></div>
  ));

  return (
    <div className="flex items-end justify-center h-16 mx-auto">
      {bars}
    </div>
  );
};

export default MusicVisualizer;
