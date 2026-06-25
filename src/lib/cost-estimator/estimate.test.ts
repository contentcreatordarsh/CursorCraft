import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estimateCost } from './estimate.ts';

describe('estimateCost', () => {
  it('returns a range that grows with seats', () => {
    const small = estimateCost({
      seats: 5,
      plan: 'teams',
      modelMix: { auto: 80, frontier: 15, max: 5 },
      intensity: 'typical',
      idleSeatPercent: 0,
    });
    const large = estimateCost({
      seats: 50,
      plan: 'teams',
      modelMix: { auto: 80, frontier: 15, max: 5 },
      intensity: 'typical',
      idleSeatPercent: 0,
    });
    assert.ok(large.totalLowUsd > small.totalLowUsd);
    assert.ok(large.subscriptionUsd > small.subscriptionUsd);
  });

  it('increases overage with max-mode share', () => {
    const autoHeavy = estimateCost({
      seats: 10,
      plan: 'teams',
      modelMix: { auto: 90, frontier: 10, max: 0 },
      intensity: 'typical',
      idleSeatPercent: 0,
    });
    const maxHeavy = estimateCost({
      seats: 10,
      plan: 'teams',
      modelMix: { auto: 20, frontier: 20, max: 60 },
      intensity: 'typical',
      idleSeatPercent: 0,
    });
    assert.ok(maxHeavy.overageHighUsd > autoHeavy.overageHighUsd);
  });
});
