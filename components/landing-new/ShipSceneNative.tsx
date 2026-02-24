"use client"

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

export function ShipSceneNative() {
    const mountRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!mountRef.current) return

        let animationFrameId: number;

        function createWaterNormalMap() {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#8080ff';
            ctx.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 20000; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 512;
                const size = Math.random() * 4 + 1;
                const r = Math.floor(100 + Math.random() * 55);
                const g = Math.floor(100 + Math.random() * 55);
                ctx.fillStyle = `rgb(${r}, ${g}, 255)`;
                ctx.fillRect(x, y, size, size);
            }
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            return texture;
        }

        const container = mountRef.current;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a1014, 0.001);

        const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.set(50, 30, 150);

        const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "default" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
        const water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: createWaterNormalMap(),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x01131e,
                distortionScale: 3.7,
                fog: scene.fog !== undefined
            }
        );
        water.rotation.x = -Math.PI / 2;
        scene.add(water);

        const sky = new Sky();
        sky.scale.setScalar(10000);
        scene.add(sky);
        const skyUniforms = sky.material.uniforms;
        skyUniforms['turbidity'].value = 10.0;
        skyUniforms['rayleigh'].value = 2.0;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        const sun = new THREE.Vector3();
        const sunPhi = THREE.MathUtils.degToRad(85);
        const sunTheta = THREE.MathUtils.degToRad(160);
        sun.setFromSphericalCoords(1, sunPhi, sunTheta);
        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();

        const ambientLight = new THREE.AmbientLight(0x112233, 0.3);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xcceeff, 2.0);
        mainLight.position.setFromSphericalCoords(200, sunPhi, sunTheta);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        mainLight.shadow.bias = -0.0001;
        scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0x001122, 1.0);
        fillLight.position.set(0, -10, 50);
        scene.add(fillLight);

        const shipGroup = new THREE.Group();
        const steelDark = new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.4, metalness: 0.7 });
        const steelRed = new THREE.MeshStandardMaterial({ color: 0x330505, roughness: 0.6, metalness: 0.2 });
        const steelWhite = new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.4, metalness: 0.5 });

        const hullLength = 200;
        const hullWidth = 32;

        function createParabolicHull(width: number, height: number, length: number, material: THREE.Material, isLower: boolean, sheerStrength = 0) {
            const geo = new THREE.BoxGeometry(width, height, length, 60, 12, 120);
            const pos = geo.attributes.position;
            const vector = new THREE.Vector3();

            for (let i = 0; i < pos.count; i++) {
                vector.set(pos.getX(i), pos.getY(i), pos.getZ(i));
                const zNorm = vector.z / (length / 2);
                const yNorm = vector.y / (height / 2);

                let widthFactor = 1.0;

                if (zNorm < -0.2) {
                    const t = (zNorm - (-0.2)) / (-0.8);
                    widthFactor = 1.0 - (Math.pow(t, 3) * 0.98);
                } else if (zNorm > 0.45) {
                    const t = (zNorm - 0.45) / 0.55;
                    widthFactor = 1.0 - (Math.pow(t, 2.2) * 0.5);
                }

                if (isLower) {
                    const isMidship = zNorm > -0.2 && zNorm < 0.45;
                    const roundness = isMidship ? 0.15 : 0.8;

                    if (yNorm < -0.1) {
                        const yDepth = (yNorm - (-0.1)) / -0.9;
                        widthFactor *= (1.0 - (Math.pow(yDepth, 4) * roundness));
                    }
                } else {
                    if (zNorm < -0.4) {
                        const bowProximity = (zNorm - (-0.4)) / -0.6;
                        if (yNorm > -0.5) {
                            const flareStrength = Math.pow(bowProximity, 2) * (yNorm + 0.5);
                            widthFactor += flareStrength * 0.8;
                        }
                    }
                }

                vector.x *= widthFactor;

                if (sheerStrength > 0) {
                    let sheerOffset = 0;
                    if (zNorm < -0.35) {
                        const t = (zNorm - (-0.35)) / (-0.65);
                        sheerOffset = Math.pow(t, 2) * 8.0;
                    }
                    else if (zNorm > 0.45) {
                        const t = (zNorm - 0.45) / 0.55;
                        sheerOffset = Math.pow(t, 2) * 2.0;
                    }
                    vector.y += sheerOffset;
                }
                pos.setXYZ(i, vector.x, vector.y, vector.z);
            }
            geo.computeVertexNormals();
            const mesh = new THREE.Mesh(geo, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        }

        function getHullWidth(z: number) {
            const zNorm = z / (hullLength / 2);
            let widthFactor = 1.0;
            if (zNorm < -0.2) {
                const t = (zNorm - (-0.2)) / (-0.8);
                widthFactor = 1.0 - (Math.pow(t, 3) * 0.98);
            } else if (zNorm > 0.45) {
                const t = (zNorm - 0.45) / 0.55;
                widthFactor = 1.0 - (Math.pow(t, 2.2) * 0.5);
            }
            return hullWidth * widthFactor;
        }

        const lowerHull = createParabolicHull(hullWidth, 8, hullLength - 4, steelRed, true, 0);
        lowerHull.position.y = 0;
        shipGroup.add(lowerHull);

        const upperHull = createParabolicHull(hullWidth, 12, hullLength, steelDark, false, 1);
        upperHull.position.y = 10;
        shipGroup.add(upperHull);

        const bulbGeo = new THREE.CylinderGeometry(0, 3, 10, 32);
        bulbGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        bulbGeo.applyMatrix4(new THREE.Matrix4().makeScale(0.8, 0.8, 1.0));
        const bulb = new THREE.Mesh(bulbGeo, steelRed);
        bulb.position.set(0, -3, -(hullLength / 2) + 2);
        shipGroup.add(bulb);

        const bulbCap = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32), steelRed);
        bulbCap.scale.set(0.8, 0.8, 1.5);
        bulbCap.position.set(0, -3, -(hullLength / 2) - 3);
        shipGroup.add(bulbCap);

        const transom = new THREE.Mesh(new THREE.BoxGeometry(hullWidth * 0.5, 12, 1), steelDark);
        transom.position.set(0, 10, (hullLength / 2) - 0.5);
        shipGroup.add(transom);

        const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.5, 12, 8), steelRed);
        rudder.position.set(0, -4, (hullLength / 2) - 5);
        shipGroup.add(rudder);

        const propHousing = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 32), steelRed);
        propHousing.rotation.x = Math.PI / 2;
        propHousing.position.set(0, -4, (hullLength / 2) - 2);
        shipGroup.add(propHousing);

        const bridgeGroup = new THREE.Group();
        bridgeGroup.position.set(0, 16, (hullLength / 2) - 25);

        const level1 = new THREE.Mesh(new THREE.BoxGeometry(32, 10, 25), steelWhite);
        level1.castShadow = true;
        level1.receiveShadow = true;
        bridgeGroup.add(level1);

        const level2 = new THREE.Mesh(new THREE.BoxGeometry(34, 6, 15), steelWhite);
        level2.position.y = 8;
        level2.castShadow = true;
        bridgeGroup.add(level2);

        const bridgeDeck = new THREE.Group();
        bridgeDeck.position.y = 14;

        const wheelhouse = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 10), steelWhite);
        bridgeDeck.add(wheelhouse);

        const wingGeo = new THREE.BoxGeometry(14, 2, 4);
        wingGeo.translate(7, 0, 0);

        const leftWing = new THREE.Mesh(wingGeo, steelWhite);
        leftWing.position.set(10, -1.5, 0);
        leftWing.rotation.y = -0.2;
        bridgeDeck.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, steelWhite);
        rightWing.position.set(-10, -1.5, 0);
        rightWing.rotation.y = -Math.PI + 0.2;
        bridgeDeck.add(rightWing);

        const windows = new THREE.Mesh(new THREE.BoxGeometry(19, 1.5, 10.1), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        windows.position.y = 0.5;
        bridgeDeck.add(windows);

        bridgeGroup.add(bridgeDeck);

        const funnelGroup = new THREE.Group();
        funnelGroup.position.set(0, 18, 10);

        const funnelBase = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 14), steelWhite);
        funnelGroup.add(funnelBase);

        const stackGeo = new THREE.CylinderGeometry(3, 4, 10, 16);
        stackGeo.scale(1, 1, 1.5);
        const stack = new THREE.Mesh(stackGeo, steelWhite);
        stack.position.y = 8;
        funnelGroup.add(stack);

        const stackTop = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, 2, 16), new THREE.MeshBasicMaterial({ color: 0x111111 }));
        stackTop.scale.set(1, 1, 1.5);
        stackTop.position.y = 13;
        funnelGroup.add(stackTop);

        bridgeGroup.add(funnelGroup);

        const mast = new THREE.Group();
        mast.position.set(0, 19, -5);
        const mastPole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 12), steelWhite);
        mast.add(mastPole);
        const radarBar = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 0.5), steelWhite);
        radarBar.position.y = 4;
        mast.add(radarBar);
        bridgeGroup.add(mast);

        shipGroup.add(bridgeGroup);

        const cSize = { w: 2.5, h: 2.5, l: 6 };
        const cGeo = new THREE.BoxGeometry(cSize.w, cSize.h, cSize.l);
        const cMat = new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.3 });

        const stackStartZ = -(hullLength / 2) + 12;
        const rows = 12;
        const cols = 24;
        const maxStack = 8;
        const totalCount = rows * cols * maxStack;

        const instancedContainers = new THREE.InstancedMesh(cGeo, cMat, totalCount);
        instancedContainers.castShadow = true;
        instancedContainers.receiveShadow = true;

        const dummy = new THREE.Object3D();
        const color = new THREE.Color();
        const containerPalette = [
            0x551111, 0x112233, 0x223333, 0x664422, 0x333333, 0x999999
        ];

        let index = 0;
        for (let z = 0; z < cols; z++) {
            const zPos = stackStartZ + (z * (cSize.l + 0.5));
            const availableWidth = getHullWidth(zPos);

            if (z % 5 === 0 && z !== 0) continue;
            if (zPos > (hullLength / 2) - 35) continue;

            for (let x = 0; x < rows; x++) {
                const xPos = (x * (cSize.w + 0.2)) - ((rows * cSize.w) / 2) + 1.25;
                if (Math.abs(xPos) > (availableWidth / 2) - 2) continue;

                let h = Math.floor(Math.random() * 6) + 2;
                if (Math.abs(xPos) > (availableWidth / 2) - 6) h = Math.max(2, h - 3);

                const t = zPos / (hullLength / 2);
                let sheerY = 0;
                if (t < -0.2) sheerY = Math.pow((t - (-0.2)) / (-0.8), 2) * 7.5;
                else if (t > 0.4) sheerY = Math.pow((t - 0.4) / 0.6, 2) * 2.5;

                for (let y = 0; y < h; y++) {
                    dummy.position.set(xPos, 17.5 + (y * cSize.h) + sheerY, zPos);
                    dummy.rotation.y = (Math.random() - 0.5) * 0.05;
                    dummy.updateMatrix();
                    instancedContainers.setMatrixAt(index, dummy.matrix);

                    color.setHex(containerPalette[Math.floor(Math.random() * containerPalette.length)]);
                    instancedContainers.setColorAt(index, color);
                    index++;
                }
            }
        }
        shipGroup.add(instancedContainers);

        const addNavLight = (col: number, x: number, y: number, z: number, intensity: number) => {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 4, 4), new THREE.MeshBasicMaterial({ color: col }));
            mesh.position.set(x, y, z);
            shipGroup.add(mesh);
            const l = new THREE.PointLight(col, intensity, 60);
            l.position.set(x, y, z);
            shipGroup.add(l);
        };

        addNavLight(0xff0000, -16, 15, -(hullLength / 2) + 10, 8);
        addNavLight(0x00ff00, 16, 15, -(hullLength / 2) + 10, 8);
        addNavLight(0xffaa00, 0, 45, (hullLength / 2) - 30, 10);

        scene.add(shipGroup);

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));

        const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloom.threshold = 0.7;
        bloom.strength = 0.4;
        bloom.radius = 0.3;
        composer.addPass(bloom);
        composer.addPass(new OutputPass());

        let targetScroll = 0;
        let currentScroll = 0;

        const clock = new THREE.Clock();

        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            water.material.uniforms['time'].value += 1.0 / 60.0;

            const heave = Math.sin(t * 0.4) * 1.5 + Math.sin(t * 0.15) * 0.5;
            shipGroup.position.y = heave - 1.5;

            shipGroup.rotation.z = Math.cos(t * 0.25) * 0.03;
            shipGroup.rotation.x = Math.sin(t * 0.2) * 0.02;

            currentScroll += (targetScroll - currentScroll) * 0.05;

            shipGroup.position.z = -currentScroll * 800;

            const camBob = Math.sin(t * 0.5) * 0.5;

            const targetY = 30 + (currentScroll * 40) + camBob;
            const targetZ = 150 + (currentScroll * 150);

            camera.position.y += (targetY - camera.position.y) * 0.05;
            camera.position.z += (targetZ - camera.position.z) * 0.05;
            camera.lookAt(0, 15, shipGroup.position.z);

            composer.render();
        }
        animate();

        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const rawProgress = window.scrollY / totalHeight;
            targetScroll = Math.min(Math.max(rawProgress, 0), 1);
        };

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
            scene.clear();
        };

    }, [])

    return <div ref={mountRef} className="fixed top-0 left-0 w-full h-[100vh] z-0 pointer-events-none" />
}
