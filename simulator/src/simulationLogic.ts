export type RiskLevel = 'CLEAR' | 'WARNING' | 'CRITICAL';

export interface CarState {
  pos: number;
  speed: number;
  dir: 'LTR' | 'RTL';
}

/**
 * Calculate TTC and Risk Level between two vehicles
 */
export function calculateRisk(
  pos1: number,
  speed1: number,
  dir1: 'LTR' | 'RTL',
  pos2: number,
  speed2: number,
  dir2: 'LTR' | 'RTL',
  scale: number = 40
): { ttc: number | null; riskLevel: RiskLevel } {
  // If moving in same direction
  if (dir1 === dir2) {
    return { ttc: null, riskLevel: 'CLEAR' };
  }

  // Head-on approach
  const distance = Math.abs(pos2 - pos1) / scale; // meters
  const closingSpeed = (speed1 + speed2) / 3.6; // m/s
  
  if (closingSpeed <= 0) {
    return { ttc: null, riskLevel: 'CLEAR' };
  }

  const ttc = distance / closingSpeed;
  let riskLevel: RiskLevel = 'CLEAR';
  if (ttc <= 2) {
    riskLevel = 'CRITICAL';
  } else if (ttc <= 5) {
    riskLevel = 'WARNING';
  }

  return { ttc, riskLevel };
}

/**
 * Simulate V2V Message Queue & Impairments
 */
export interface V2VMessage {
  senderId: string;
  pos: number;
  speed: number;
  dir: 'LTR' | 'RTL';
  timestamp: number;
}

export interface V2VConfig {
  enabled: boolean;
  delayMs: number;
  packetLossPercent: number; // 0 to 100
  stalenessThresholdSec: number;
}

export class V2VNetworkSimulator {
  private queue: { msg: V2VMessage; deliverAt: number }[] = [];
  private config: V2VConfig;

  constructor(config: V2VConfig) {
    this.config = config;
  }

  public send(msg: V2VMessage, now: number): void {
    if (!this.config.enabled) return;

    if (this.config.packetLossPercent > 0) {
      const dropHash = (msg.timestamp + msg.pos) % 100;
      if (dropHash < this.config.packetLossPercent) {
        return; // Dropped
      }
    }

    const deliverAt = now + this.config.delayMs;
    this.queue.push({ msg, deliverAt });
  }

  public receive(now: number): V2VMessage | null {
    if (!this.config.enabled) return null;

    const readyIndex = this.queue.findIndex(item => item.deliverAt <= now);
    if (readyIndex === -1) return null;

    const item = this.queue.splice(readyIndex, 1)[0];
    const ageSec = (now - item.msg.timestamp) / 1000;

    if (ageSec > this.config.stalenessThresholdSec) {
      return null; // Stale message discarded
    }

    return item.msg;
  }

  public clear(): void {
    this.queue = [];
  }
}
