import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layout } from '../components/Layout';

export function LandingRoute() {
  return (
    <Layout>
      <style>{`
        @keyframes rotateY {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
        .rotating-card {
          animation: rotateY 20s linear infinite;
          transform-style: preserve-3d;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transform: rotateY(180deg);
        }
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          width: 100%;
          height: 100%;
        }
        .noise-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.2'/%3E%3C/svg%3E");
          pointer-events: none;
        }
      `}</style>
      
      <div className="flex items-center justify-center p-12 bg-black h-full overflow-hidden">
        <div className="relative" style={{ perspective: '2000px', width: '480px', height: '672px', filter: 'blur(3px) contrast(1.1) saturate(1.2)', transform: 'rotateZ(15deg) scale(0.75)' }}>
          <div className="rotating-card">
            {/* Front face */}
            <div className="card-face">
              <div className="gradient-bg"></div>
              <div className="noise-overlay"></div>
            </div>
            {/* Back face */}
            <div className="card-back">
              <div className="gradient-bg"></div>
              <div className="noise-overlay"></div>
            </div>
          </div>
        </div>

        {/* Monthly Credits Section - Overlayed (outside blurred container) */}
        <div className="absolute bottom-16 left-16 text-white z-30 max-w-sm">
          <h1 className="text-5xl font-medium mb-4">
            TRADING<br />PLATFORM
          </h1>
          <p className="text-white text-base leading-relaxed">
            Capture your best memories, augment them with AI, and trade them with other around the world.
          </p>
        </div>
      </div>
    </Layout>
  );
}
