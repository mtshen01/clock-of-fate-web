import { useEffect, useState } from 'react';
import {
  loadMotionIndex,
  type MonsterMotion,
  type MotionActionId,
  type MotionIndex,
} from '../data';
import { MOTION_LABELS } from '../motion';

export function useMonsterMotion(monsterId: string): MonsterMotion | null {
  const [index, setIndex] = useState<MotionIndex | null>(null);

  useEffect(() => {
    let active = true;
    void loadMotionIndex().then((value) => {
      if (active) setIndex(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return index?.monsters[monsterId] ?? null;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

interface MonsterMotionStageProps {
  motion: MonsterMotion;
  action: MotionActionId;
  playToken: number;
  name: string;
}

/**
 * 精灵图播放器：一张图按 4 列排布，逐帧切换 background-position。
 * 不使用 CSS steps，避免不同帧数下关键帧难以维护。
 */
export function MonsterMotionStage({ motion, action, playToken, name }: MonsterMotionStageProps) {
  const definition = motion.actions[action];
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    if (!definition || reduced) return;

    let raf = 0;
    let started = 0;
    const tick = (now: number) => {
      if (!started) started = now;
      const index = Math.floor(((now - started) / 1000) * definition.fps);
      if (definition.loop) {
        setFrame(index % definition.frameCount);
        raf = requestAnimationFrame(tick);
      } else if (index < definition.frameCount) {
        setFrame(index);
        raf = requestAnimationFrame(tick);
      } else {
        setFrame(definition.frameCount - 1);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [definition, playToken, reduced]);

  if (!definition) return null;

  const column = frame % definition.cols;
  const row = Math.floor(frame / definition.cols);
  const positionX = definition.cols > 1 ? (column / (definition.cols - 1)) * 100 : 0;
  const positionY = definition.rows > 1 ? (row / (definition.rows - 1)) * 100 : 0;

  return (
    <div
      className="monster-motion-stage"
      style={{ aspectRatio: `${motion.frameWidth} / ${motion.frameHeight}` }}
      role="img"
      aria-label={`${name} · ${MOTION_LABELS[action].label}动作`}
    >
      <div
        className="monster-motion-sprite"
        style={{
          backgroundImage: `url("${definition.sheet}")`,
          backgroundSize: `${definition.cols * 100}% ${definition.rows * 100}%`,
          backgroundPosition: `${positionX}% ${positionY}%`,
        }}
      />
    </div>
  );
}
