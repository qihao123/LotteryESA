import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const LotterySphere = ({ participants, isSpinning, rotationSpeed, onWinner, winner }) => {
  const meshRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [particles, setParticles] = useState([]);
  const [winnerEffect, setWinnerEffect] = useState(null);

  // 准备粒子数据
  useEffect(() => {
    if (participants && participants.length > 0) {
      const newParticles = participants.map((participant, index) => {
        // 确保粒子均匀分布在球面上
        const theta = Math.acos(2 * Math.random() - 1); // 极角
        const phi = 2 * Math.PI * Math.random(); // 方位角
        const radius = 1.5;
        
        return {
          id: participant.id || index,
          name: participant.name,
          position: {
            x: radius * Math.sin(theta) * Math.cos(phi),
            y: radius * Math.sin(theta) * Math.sin(phi),
            z: radius * Math.cos(theta)
          },
          color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6)
        };
      });
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [participants]);

  // 抽奖旋转动画
  useEffect(() => {
    let animationFrameId;
    let speed = rotationSpeed * 0.01;

    const animate = () => {
      if (isSpinning) {
        setRotation(prev => ({
          x: prev.x + speed * 0.1,
          y: prev.y + speed,
          z: prev.z + speed * 0.2
        }));
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (isSpinning) {
      animate();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isSpinning, rotationSpeed]);

  // 停止旋转时选择中奖者
  const wasSpinningRef = useRef(false);
  useEffect(() => {
    if (isSpinning) {
      wasSpinningRef.current = true;
    } else if (wasSpinningRef.current && participants.length > 0) {
      // 只有从旋转状态变为停止状态时才选择中奖者
      wasSpinningRef.current = false;
      // 等待旋转停止后选择中奖者
      const timer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * participants.length);
        const winner = participants[randomIndex];
        onWinner(winner);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isSpinning, participants, onWinner]);

  // 中奖效果
  const [localWinner, setLocalWinner] = useState(null);
  
  // 同步外部传入的中奖者
  useEffect(() => {
    if (winner) {
      setLocalWinner(winner);
    }
  }, [winner]);
  
  // 中奖视觉效果
  useEffect(() => {
    if (localWinner && localWinner.id) {
      // 找到中奖者的粒子位置
      const winningParticle = particles.find(p => p.id === localWinner.id);
      if (winningParticle) {
        setWinnerEffect({
          ...winningParticle,
          scale: 1,
          opacity: 1
        });
        
        // 效果动画 - 先放大后淡出
        const timer = setTimeout(() => {
          setWinnerEffect(prev => prev ? {...prev, scale: 2, opacity: 0} : null);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [localWinner, particles]);

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      {/* 环境光 */}
      <ambientLight intensity={0.3} />
      
      {/* 主光源 */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* 半球光 */}
      <hemisphereLight color="#667eea" groundColor="#16213e" intensity={0.5} />
      
      {/* 抽奖球体 */}
      <group ref={meshRef} rotation={[rotation.x, rotation.y, rotation.z]}>
        {/* 球体外壳 */}
        <mesh scale={1.7}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color="#667eea" 
            transparent 
            opacity={0.1} 
            side={THREE.DoubleSide} 
            wireframe
          />
        </mesh>

        {/* 参与者粒子 */}
        {particles.map(particle => (
          <group key={particle.id} position={[particle.position.x, particle.position.y, particle.position.z]}>
            {/* 粒子发光效果 */}
            <mesh scale={0.08}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial 
                color={particle.color} 
                emissive={particle.color} 
                emissiveIntensity={0.5}
              />
            </mesh>
            
            {/* 参与者名称 */}
            <Text
              position={[0, 0.3, 0]}
              rotation={[0, 0, 0]}
              fontSize={0.15}
              color="white"
              anchorX="center"
              anchorY="middle"
              font={undefined}
            >
              {particle.name}
            </Text>
          </group>
        ))}

        {/* 中奖特效 */}
        {winnerEffect && (
          <group position={[winnerEffect.position.x, winnerEffect.position.y, winnerEffect.position.z]}>
            {/* 脉冲光圈 */}
            <mesh scale={[winnerEffect.scale * 2, winnerEffect.scale * 2, winnerEffect.scale * 2]}>
              <ringGeometry args={[0, 0.5, 32]} />
              <meshBasicMaterial 
                color="#ffd700" 
                transparent 
                opacity={winnerEffect.opacity * 0.5} 
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* 中奖者高亮 */}
            <mesh scale={0.2}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial 
                color="#ffd700" 
                emissive="#ffd700" 
                emissiveIntensity={2}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* 中央装饰 */}
      <group position={[0, 0, 0]}>
        <mesh scale={0.2}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color="#ff6b35" 
            emissive="#ff6b35" 
            emissiveIntensity={1}
          />
        </mesh>
        
        {/* 旋转光环 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.02, 16, 100]} />
          <meshStandardMaterial 
            color="#764ba2" 
            transparent 
            opacity={0.6}
          />
        </mesh>
      </group>

      {/* 轨道控制（可选） */}
      <OrbitControls 
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
      />
    </Canvas>
  );
};

export default LotterySphere;