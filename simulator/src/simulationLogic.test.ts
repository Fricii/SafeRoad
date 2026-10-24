import { describe, it, expect } from 'vitest';
import { calculateRisk, V2VNetworkSimulator } from './simulationLogic';
import type { V2VMessage } from './simulationLogic';

describe('SafeRoad Automated Safety & V2V Tests', () => {
  
  // 1. Head-On Approach
  it('1. Head-On Approach: detects risk when vehicles move towards each other', () => {
    const result = calculateRisk(100, 60, 'LTR', 500, 60, 'RTL', 40);
    expect(result.riskLevel).not.toBe('CLEAR');
    expect(result.ttc).not.toBeNull();
  });

  // 2. Safe Separation
  it('2. Safe Separation: reports CLEAR when vehicles maintain adequate distance', () => {
    const result = calculateRisk(100, 30, 'LTR', 1200, 30, 'LTR', 40);
    expect(result.riskLevel).toBe('CLEAR');
  });

  // 3. TTC Thresholds (Critical <= 2s, Warning <= 5s, Clear > 5s)
  it('3. TTC Thresholds: correctly categorizes CRITICAL, WARNING, and CLEAR', () => {
    const critical = calculateRisk(200, 100, 'LTR', 240, 100, 'RTL', 40);
    expect(critical.riskLevel).toBe('CRITICAL');
    expect(critical.ttc).toBeLessThanOrEqual(2);

    const warning = calculateRisk(0, 54, 'LTR', 4000, 54, 'RTL', 40);
    expect(warning.riskLevel).toBe('WARNING');
    expect(warning.ttc).toBeGreaterThan(2);
    expect(warning.ttc).toBeLessThanOrEqual(5);

    const clear = calculateRisk(0, 10, 'LTR', 5000, 10, 'RTL', 40);
    expect(clear.riskLevel).toBe('CLEAR');
    expect(clear.ttc).toBeGreaterThan(5);
  });

  // 4. Independent V2V Estimate
  it('4. Independent V2V Estimate: calculates separate perception vs V2V states', () => {
    const localRisk = calculateRisk(100, 50, 'LTR', 180, 50, 'RTL', 40);
    const v2vRisk = calculateRisk(100, 50, 'LTR', 8000, 50, 'RTL', 40);

    expect(localRisk.riskLevel).toBe('CRITICAL');
    expect(v2vRisk.riskLevel).toBe('CLEAR');
  });

  // 5. V2V Disabled
  it('5. V2V Disabled: ignores messages when V2V is disabled', () => {
    const v2vNet = new V2VNetworkSimulator({
      enabled: false,
      delayMs: 100,
      packetLossPercent: 0,
      stalenessThresholdSec: 2
    });

    const msg: V2VMessage = { senderId: 'car2', pos: 500, speed: 50, dir: 'RTL', timestamp: 1000 };
    v2vNet.send(msg, 1000);
    const received = v2vNet.receive(1200);

    expect(received).toBeNull();
  });

  // 6. Message Delay
  it('6. Message Delay: queues messages and delivers them after configured delay', () => {
    const v2vNet = new V2VNetworkSimulator({
      enabled: true,
      delayMs: 250,
      packetLossPercent: 0,
      stalenessThresholdSec: 5
    });

    const msg: V2VMessage = { senderId: 'car2', pos: 400, speed: 60, dir: 'RTL', timestamp: 1000 };
    v2vNet.send(msg, 1000);

    const earlyReceive = v2vNet.receive(1150);
    expect(earlyReceive).toBeNull();

    const lateReceive = v2vNet.receive(1300);
    expect(lateReceive).not.toBeNull();
    expect(lateReceive?.senderId).toBe('car2');
  });

  // 7. 100% Packet Loss
  it('7. 100% Packet Loss: drops all transmitted V2V messages', () => {
    const v2vNet = new V2VNetworkSimulator({
      enabled: true,
      delayMs: 0,
      packetLossPercent: 100,
      stalenessThresholdSec: 5
    });

    const msg: V2VMessage = { senderId: 'car2', pos: 300, speed: 50, dir: 'RTL', timestamp: 1000 };
    v2vNet.send(msg, 1000);
    const received = v2vNet.receive(1000);

    expect(received).toBeNull();
  });

  // 8. Staleness
  it('8. Staleness: discards messages older than staleness threshold', () => {
    const v2vNet = new V2VNetworkSimulator({
      enabled: true,
      delayMs: 0,
      packetLossPercent: 0,
      stalenessThresholdSec: 2
    });

    const msg: V2VMessage = { senderId: 'car2', pos: 300, speed: 50, dir: 'RTL', timestamp: 1000 };
    v2vNet.send(msg, 1000);
    const received = v2vNet.receive(4000);

    expect(received).toBeNull();
  });

  // 9. Scenario Switching
  it('9. Scenario Switching: resets queues and state correctly', () => {
    const v2vNet = new V2VNetworkSimulator({
      enabled: true,
      delayMs: 100,
      packetLossPercent: 0,
      stalenessThresholdSec: 5
    });

    const msg: V2VMessage = { senderId: 'car2', pos: 300, speed: 50, dir: 'RTL', timestamp: 1000 };
    v2vNet.send(msg, 1000);

    v2vNet.clear();
    const received = v2vNet.receive(1200);

    expect(received).toBeNull();
  });

});
