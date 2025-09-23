import React, { useEffect, useState } from 'react';

export function Confetti() {
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    // Generate confetti pieces
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)]
    }));
    
    setConfettiPieces(pieces);

    // Auto-remove after animation
    const timer = setTimeout(() => {
      setConfettiPieces([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 animate-pulse"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            animation: `fall 3s linear forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          from {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}