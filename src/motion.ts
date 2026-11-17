import { MOTION_ACTION_IDS, type MonsterMotion, type MotionActionId } from './data';

export const MOTION_LABELS: Record<MotionActionId, { label: string; note: string }> = {
  idle: { label: '待机', note: '循环呼吸' },
  attack: { label: '攻击', note: '出招动作' },
  defense: { label: '防御', note: '格挡动作' },
  hit: { label: '受击', note: '受击反馈' },
  cast: { label: '施法', note: '吟唱与强化' },
  death: { label: '死亡', note: '倒地消散' },
};

/** 按固定顺序返回该生物实际拥有的动作。 */
export function availableMotionActions(motion: MonsterMotion): MotionActionId[] {
  return MOTION_ACTION_IDS.filter((action) => !!motion.actions[action]);
}

/** 招式意图 → 动作片段的近似映射，用于在招式行里预览动画。 */
export function motionActionForIntent(intent: string): MotionActionId {
  if (intent.startsWith('attack') || intent === 'death_blow') return 'attack';
  if (intent === 'block' || intent === 'defend') return 'defense';
  if (intent === 'hit') return 'hit';
  if (intent === 'death') return 'death';
  if (intent === 'escape' || intent === 'sleep' || intent === 'stun') return 'idle';
  return 'cast';
}
