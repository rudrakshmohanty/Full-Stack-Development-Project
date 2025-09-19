"use client"

import { useEffect, useState } from "react"

interface FloatingShape {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  type: "blob" | "circle" | "organic"
}

interface Particle {
  id: number
  x: number
  y: number
  delay: number
  duration: number
}

export function FloatingShapes() {
  const [shapes, setShapes] = useState<FloatingShape[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    const generateShapes = () => {
      const newShapes: FloatingShape[] = []
      for (let i = 0; i < 8; i++) {
        newShapes.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 300 + 150,
          delay: Math.random() * 8,
          duration: Math.random() * 15 + 20,
          type: ["blob", "circle", "organic"][Math.floor(Math.random() * 3)] as "blob" | "circle" | "organic",
        })
      }
      return newShapes
    }

    const generateParticles = () => {
      const newParticles: Particle[] = []
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 5,
          duration: 2 + Math.random() * 3,
        })
      }
      return newParticles
    }

    setShapes(generateShapes())
    setParticles(generateParticles())
  }, [])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null
  }

  const getShapeStyle = (shape: FloatingShape) => {
    const baseStyle = {
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      width: `${shape.size}px`,
      height: `${shape.size}px`,
      animationDelay: `${shape.delay}s`,
      animationDuration: `${shape.duration}s`,
      filter: "blur(60px)",
    }

    const gradients = [
      `linear-gradient(135deg, 
        oklch(0.65 0.25 264 / 0.4) 0%, 
        oklch(0.75 0.25 300 / 0.3) 50%, 
        oklch(0.85 0.25 330 / 0.2) 100%)`,
      `radial-gradient(circle, 
        oklch(0.7 0.3 200 / 0.3) 0%, 
        oklch(0.8 0.25 240 / 0.2) 70%, 
        transparent 100%)`,
      `conic-gradient(from 45deg, 
        oklch(0.6 0.3 280 / 0.4), 
        oklch(0.8 0.25 320 / 0.2), 
        oklch(0.75 0.3 350 / 0.3), 
        oklch(0.6 0.3 280 / 0.4))`,
    ]

    return {
      ...baseStyle,
      background: gradients[shape.id % gradients.length],
    }
  }

  const getShapeClasses = (shape: FloatingShape) => {
    const baseClasses = "absolute animate-float transform-gpu"
    
    switch (shape.type) {
      case "blob":
        return `${baseClasses} rounded-[60%_40%_30%_70%] hover:rounded-[40%_60%_70%_30%] transition-all duration-[8000ms]`
      case "circle":
        return `${baseClasses} rounded-full`
      case "organic":
        return `${baseClasses} rounded-[30%_70%_70%_30%] hover:rounded-[70%_30%_30%_70%] transition-all duration-[6000ms]`
      default:
        return baseClasses
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {shapes.map((shape) => (
        <div key={shape.id} className={getShapeClasses(shape)} style={getShapeStyle(shape)} />
      ))}

      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
