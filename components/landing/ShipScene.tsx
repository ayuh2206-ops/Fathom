"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, PerspectiveCamera, ContactShadows } from "@react-three/drei"
import React, { useRef, useMemo } from "react"
import * as THREE from "three"

// Placeholder Ship Geometry (Simplified Container Ship)
function Ship({ ...props }) {
    const group = useRef<THREE.Group>(null)

    // Animate ship movement (simulated)
    useFrame((state) => {
        if (group.current) {
            group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
            group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.01
        }
    })

    return (
        <group ref={group} {...props} dispose={null}>
            {/* Hull */}
            <mesh position={[0, -1, 0]} castShadow receiveShadow>
                <boxGeometry args={[4, 1.5, 12]} />
                <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.4} />
            </mesh>
            {/* Deck */}
            <mesh position={[0, -0.2, 0]} receiveShadow>
                <boxGeometry args={[4.2, 0.2, 12.2]} />
                <meshStandardMaterial color="#475569" />
            </mesh>

            {/* Bridge/Superstructure */}
            <mesh position={[0, 1.5, -4]} castShadow>
                <boxGeometry args={[3, 3, 2]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>

            {/* Containers (Procedural blocks) */}
            <Containers />
        </group>
    )
}

function Containers() {
    const containers = useMemo(() => {
        const items = []
        const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#64748b"] // Red, Blue, Green, Yellow, Slate

        for (let x = -1.5; x <= 1.5; x += 1.1) {
            for (let z = -2; z <= 4; z += 2.1) {
                for (let y = 0; y < 3; y += 1.1) {
                    if (Math.random() > 0.3) {
                        items.push({
                            position: [x, 0.5 + y, z],
                            color: colors[Math.floor(Math.random() * colors.length)]
                        })
                    }
                }
            }
        }
        return items
    }, [])

    return (
        <group>
            {containers.map((c, i) => (
                <mesh key={i} position={c.position as any} castShadow>
                    <boxGeometry args={[1, 1, 2]} />
                    <meshStandardMaterial color={c.color} roughness={0.5} />
                </mesh>
            ))}
        </group>
    )
}

function Ocean() {
    // Simple plane for now, shader water is complex to setup in one go without external assets
    // We simulate water with a reflective, blue surface
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial
                color="#0ea5e9"
                transparent
                opacity={0.8}
                roughness={0.1}
                metalness={0.8}
            />
        </mesh>
    )
}

export function ShipScene() {
    return (
        <div className="w-full h-full">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[8, 6, 10]} fov={45} />

                <color attach="background" args={['#020617']} />
                <fog attach="fog" args={['#020617', 5, 30]} />

                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />

                <Float
                    speed={2}
                    rotationIntensity={0.2}
                    floatIntensity={0.5}
                    floatingRange={[-0.2, 0.2]}
                >
                    <Ship rotation={[0, -Math.PI / 4, 0]} />
                </Float>

                <Ocean />

                <ContactShadows
                    resolution={512}
                    scale={30}
                    blur={2}
                    opacity={0.5}
                    far={10}
                    color="#000000"
                />

                <Environment preset="night" />
            </Canvas>
        </div>
    )
}
