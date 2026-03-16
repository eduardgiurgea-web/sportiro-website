import { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Environment } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { albumCubeConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

interface CubeProps {
  rotationProgress: number;
  isMobile: boolean;
  mousePos: { x: number; y: number };
  currentAlbumIndex: number;
}

const PuzzleCube = ({ rotationProgress, isMobile, mousePos, currentAlbumIndex }: CubeProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const textures = useTexture(albumCubeConfig.cubeTextures);

  const cubeSize = isMobile 
    ? Math.min(viewport.width * 0.5, 2)
    : Math.min(viewport.width * 0.3, 2.2);

  const segmentSize = cubeSize / 3;

  // Pre-calculate puzzle pieces and their UV mapping
  const pieces = useMemo(() => {
    const geos = [];
    // We want a 3x3x3 grid
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          
          // Create geometry for each minicube
          const geo = new THREE.BoxGeometry(segmentSize, segmentSize, segmentSize);
          const uvs = geo.attributes.uv;
          
          // Helper to map a face of the minicube to a section of the main texture
          const setFaceUV = (faceIndex: number, uIndex: number, vIndex: number) => {
            const u0 = uIndex / 3;
            const u1 = (uIndex + 1) / 3;
            const v0 = vIndex / 3;
            const v1 = (vIndex + 1) / 3;
            
            // BoxGeometry UVs are stored per-vertex for each face. 4 vertices * 2 coords = 8
            const offset = faceIndex * 8;
            uvs.array[offset] = u0;     uvs.array[offset + 1] = v1; // top-left
            uvs.array[offset + 2] = u1; uvs.array[offset + 3] = v1; // top-right
            uvs.array[offset + 4] = u0; uvs.array[offset + 5] = v0; // bottom-left
            uvs.array[offset + 6] = u1; uvs.array[offset + 7] = v0; // bottom-right
          };

          // BoxGeometry faces: right(0), left(1), top(2), bottom(3), front(4), back(5)
          // Map the pieces' grid coordinates (0,1,2) to UV segments (0=left/bottom, 1=mid, 2=right/top)
          setFaceUV(0, 2 - z, y); // right (positive X)
          setFaceUV(1, z, y);     // left (negative X)
          setFaceUV(2, x, 2 - z); // top (positive Y)
          setFaceUV(3, x, z);     // bottom (negative Y)
          setFaceUV(4, x, y);     // front (positive Z)
          setFaceUV(5, 2 - x, y); // back (negative Z)
          
          uvs.needsUpdate = true;
          
          // Calculate target position in the assembled cube (relative to center)
          // Grid goes 0,1,2 -> map to -1, 0, 1 -> multiply by segment size
          const px = (x - 1) * segmentSize;
          const py = (y - 1) * segmentSize;
          const pz = (z - 1) * segmentSize;
          
          geos.push({ geo, tX: px, tY: py, tZ: pz });
        }
      }
    }
    return geos;
  }, [segmentSize]);

  // Handle explosion and assembly animation
  useEffect(() => {
    if (!groupRef.current) return;
    const children = groupRef.current.children;
    
    // 1. Initial State: Exploded outward randomly
    children.forEach((child, i) => {
      const p = pieces[i];
      const explodeDist = isMobile ? 8 : 12; // Spread them wide behind hero text
      child.position.set(
        p.tX + (Math.random() - 0.5) * explodeDist,
        p.tY + (Math.random() - 0.5) * explodeDist,
        p.tZ + (Math.random() - 0.5) * explodeDist
      );
      child.rotation.set(
        Math.random() * Math.PI * 4,
        Math.random() * Math.PI * 4,
        Math.random() * Math.PI * 4
      );
      child.scale.set(0.2, 0.2, 0.2); // Start small
    });

    // 2. Assembly Animation via ScrollTrigger
    const st = ScrollTrigger.create({
      trigger: '#albums',
      start: 'top 70%', // Start when section is halfway into view
      once: true,
      onEnter: () => {
        // Animate all pieces to their target positions (forming the main cube)
        children.forEach((child, i) => {
          const p = pieces[i];
          gsap.to(child.position, {
            x: p.tX,
            y: p.tY,
            z: p.tZ,
            duration: 2.5,
            ease: 'back.out(1.1)',
            delay: Math.random() * 0.5 // Stagger randomly
          });
          gsap.to(child.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 2.5,
            ease: 'power3.inOut',
            delay: Math.random() * 0.5
          });
          gsap.to(child.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 2,
            ease: 'back.out(1.5)',
            delay: Math.random() * 0.5
          });
        });
      }
    });

    return () => {
      st.kill();
    };
  }, [pieces, isMobile]);

  useFrame(() => {
    if (groupRef.current) {
      const targetRotationY = rotationProgress * Math.PI * 2;
      const isLastAlbum = currentAlbumIndex >= albumCubeConfig.albums.length - 1;

      // Last album: tilt cube to reveal top face; otherwise subtle tilt
      const targetRotationX = isLastAlbum
        ? -Math.PI / 2.5
        : Math.sin(rotationProgress * Math.PI) * 0.15;

      const parallaxAmount = 0.6;
      const finalY = targetRotationY + mousePos.x * parallaxAmount;
      const finalX = targetRotationX - (isLastAlbum ? 0 : mousePos.y * parallaxAmount);

      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        finalY,
        0.08
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        finalX,
        0.08
      );
    }
  });

  return (
    <group ref={groupRef}>
      {pieces.map((p, i) => (
        <mesh key={i} geometry={p.geo} castShadow receiveShadow>
          {textures.map((texture, index) => (
            <meshStandardMaterial
              key={index}
              attach={`material-${index}`}
              map={texture}
              roughness={0.2}
              metalness={0.05}
            />
          ))}
        </mesh>
      ))}
    </group>
  );
};

const AlbumCube = () => {
  if (albumCubeConfig.albums.length === 0 || albumCubeConfig.cubeTextures.length === 0) {
    return null;
  }

  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [rotationProgress, setRotationProgress] = useState(0);
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0);
  const [blurAmount, setBlurAmount] = useState(0);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: isMobile ? '+=200%' : '+=300%',
      scrub: 1,
      pin: true,
      onUpdate: (self) => {
        const progress = self.progress;
        setRotationProgress(progress);

        const albumIndex = Math.min(
          Math.floor(progress * albumCubeConfig.albums.length),
          albumCubeConfig.albums.length - 1
        );
        setCurrentAlbumIndex(albumIndex);

        const velocity = Math.abs(self.getVelocity());
        const targetBlur = Math.min(velocity / 600, isMobile ? 3 : 5);
        const targetSpacing = Math.min(velocity / 150, isMobile ? 10 : 20);

        setBlurAmount(prev => prev + (targetBlur - prev) * 0.15);
        setLetterSpacing(prev => prev + (targetSpacing - prev) * 0.15);
      },
    });

    scrollTriggerRef.current = st;

    return () => {
      st.kill();
    };
  }, [isMobile]);

  const currentAlbum = albumCubeConfig.albums[currentAlbumIndex];

  return (
    <section
      id="albums"
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden z-10"
      style={{ backgroundColor: '#f0ede6' /* Updated warm beige */ }}
      onPointerMove={(e) => {
        if (isMobile) return;
        setIsHovered(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        setMousePos({ x, y });
      }}
      onPointerLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* Side glow effects */}
      <div className="side-glow left hidden md:block" style={{ opacity: 0.4 }} />
      <div className="side-glow right hidden md:block" style={{ opacity: 0.4, animationDelay: '4s' }} />

      {/* Background title */}
      <div
        ref={titleRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        style={{
          filter: `blur(${blurAmount}px)`,
          letterSpacing: `${letterSpacing}px`,
        }}
      >
        <h2 
          className="font-serif text-[22vw] md:text-[16vw] uppercase whitespace-nowrap select-none"
          style={{ color: 'rgba(196, 184, 168, 0.15)' }}
        >
          {currentAlbum.subtitle}
        </h2>
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Canvas
          camera={{ position: [0, 0, isMobile ? 5 : 6], fov: isMobile ? 50 : 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              intensity={0.7}
              castShadow
              color="#ffffff"
            />
            <spotLight
              position={[-10, -10, -10]}
              angle={0.15}
              penumbra={1}
              intensity={0.3}
              color="#8B9B7C"
            />
            <pointLight position={[0, 0, 5]} intensity={0.2} color="#6B7B5C" />
            <PuzzleCube
              rotationProgress={rotationProgress}
              isMobile={isMobile}
              mousePos={isHovered ? mousePos : { x: 0, y: 0 }}
              currentAlbumIndex={currentAlbumIndex}
            />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      {/* Album info overlay (styled with blue blocks as requested) */}
      <div className="absolute bottom-1/3 left-6 md:left-12 z-20 max-w-sm md:max-w-xl flex flex-col items-start gap-2">
        <div className="bg-[#3061d4] px-3 py-1.5 inline-block shadow-md">
          <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-white">
            SERVIZIO {String(currentAlbum.id).padStart(2, '0')} / {String(albumCubeConfig.albums.length).padStart(2, '0')}
          </p>
        </div>

        <h3 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-snug">
          <span className="bg-[#3061d4] text-white px-4 py-1 box-decoration-clone leading-snug shadow-md transition-all duration-300">
            {currentAlbum.title}
          </span>
        </h3>

        <div className="bg-[#3061d4] px-3 py-1.5 inline-block shadow-md mt-1">
          <p className="text-xs md:text-sm font-semibold text-white tracking-wider uppercase">
            {currentAlbum.subtitle}
          </p>
        </div>
      </div>

      {/* Description — right of cube */}
      <div className="absolute bottom-1/3 right-6 md:right-16 z-20 max-w-[200px] md:max-w-[260px]">
        <p
          className="text-base md:text-lg leading-relaxed font-semibold transition-all duration-300"
          style={{ color: 'rgba(80, 70, 60, 0.9)' }}
        >
          {currentAlbum.description}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20">
        <div className="flex flex-col gap-2 md:gap-3">
          {albumCubeConfig.albums.map((album, index) => (
            <div
              key={album.id}
              className={`w-1.5 md:w-2 rounded-full transition-all duration-300 ${
                index === currentAlbumIndex
                  ? 'h-6 md:h-8'
                  : 'h-1.5 md:h-2'
              }`}
              style={{
                backgroundColor: index === currentAlbumIndex ? 'var(--sportiro-blue)' : 'var(--warm-sand)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 md:bottom-12 right-6 md:right-12 z-20">
        <p 
          className="text-[10px] md:text-xs uppercase tracking-widest font-medium"
          style={{ color: 'var(--warm-taupe)' }}
        >
          {albumCubeConfig.scrollHint}
        </p>
      </div>

      {/* Decorative corner lines */}
      <div 
        className="absolute top-8 md:top-12 left-6 md:left-12 w-12 md:w-16 h-px"
        style={{ background: 'linear-gradient(to right, var(--warm-taupe), transparent)' }}
      />
      <div 
        className="absolute top-8 md:top-12 left-6 md:left-12 w-px h-12 md:h-16"
        style={{ background: 'linear-gradient(to bottom, var(--warm-taupe), transparent)' }}
      />
    </section>
  );
};

export default AlbumCube;
