/**
 * A realistic combined sample ({ spend, usage }) so the dashboard is demoable
 * with zero input. All data is fabricated for demonstration only.
 */
export const EXAMPLE_JSON = JSON.stringify(
  {
    spend: {
      teamMemberSpend: [
        { userId: 1, name: 'Alex Rivera', email: 'alex@acme.dev', role: 'member', spendCents: 18200, overallSpendCents: 41200, fastPremiumRequests: 2120 },
        { userId: 2, name: 'Sam Cho', email: 'sam@acme.dev', role: 'owner', spendCents: 9100, overallSpendCents: 24800, fastPremiumRequests: 1340 },
        { userId: 3, name: 'Priya N', email: 'priya@acme.dev', role: 'member', spendCents: 2200, overallSpendCents: 9800, fastPremiumRequests: 610 },
        { userId: 4, name: 'Jordan Lee', email: 'jordan@acme.dev', role: 'member', spendCents: 600, overallSpendCents: 5400, fastPremiumRequests: 320 },
        { userId: 5, name: 'Taylor Brooks', email: 'taylor@acme.dev', role: 'member', spendCents: 0, overallSpendCents: 2100, fastPremiumRequests: 140 },
        { userId: 6, name: 'Morgan Diaz', email: 'morgan@acme.dev', role: 'member', spendCents: 0, overallSpendCents: 0, fastPremiumRequests: 0 },
        { userId: 7, name: 'Chris Park', email: 'chris@acme.dev', role: 'member', spendCents: 0, overallSpendCents: 0, fastPremiumRequests: 0 },
      ],
      subscriptionCycleStart: 1717200000000,
      totalMembers: 7,
      totalPages: 1,
    },
    usage: {
      data: [
        { userId: 1, email: 'alex@acme.dev', date: 1717286400000, isActive: true, mostUsedModel: 'claude-opus-max', composerRequests: 210, chatRequests: 90, agentRequests: 60, cmdkUsages: 40, totalApplies: 320, totalAccepts: 150, totalTabsShown: 800, totalTabsAccepted: 540, usageBasedReqs: 180, apiKeyReqs: 0, subscriptionIncludedReqs: 220 },
        { userId: 2, email: 'sam@acme.dev', date: 1717286400000, isActive: true, mostUsedModel: 'gpt-5', composerRequests: 140, chatRequests: 70, agentRequests: 30, cmdkUsages: 25, totalApplies: 190, totalAccepts: 130, totalTabsShown: 600, totalTabsAccepted: 430, usageBasedReqs: 60, apiKeyReqs: 0, subscriptionIncludedReqs: 180 },
        { userId: 3, email: 'priya@acme.dev', date: 1717286400000, isActive: true, mostUsedModel: 'auto', composerRequests: 80, chatRequests: 40, agentRequests: 10, cmdkUsages: 30, totalApplies: 110, totalAccepts: 95, totalTabsShown: 420, totalTabsAccepted: 360, usageBasedReqs: 5, apiKeyReqs: 0, subscriptionIncludedReqs: 160 },
        { userId: 4, email: 'jordan@acme.dev', date: 1717286400000, isActive: true, mostUsedModel: 'auto', composerRequests: 50, chatRequests: 30, agentRequests: 5, cmdkUsages: 20, totalApplies: 70, totalAccepts: 58, totalTabsShown: 300, totalTabsAccepted: 250, usageBasedReqs: 2, apiKeyReqs: 0, subscriptionIncludedReqs: 120 },
        { userId: 5, email: 'taylor@acme.dev', date: 1717286400000, isActive: true, mostUsedModel: 'claude-opus-max', composerRequests: 30, chatRequests: 15, agentRequests: 5, cmdkUsages: 8, totalApplies: 45, totalAccepts: 16, totalTabsShown: 150, totalTabsAccepted: 70, usageBasedReqs: 40, apiKeyReqs: 0, subscriptionIncludedReqs: 60 },
        { userId: 6, email: 'morgan@acme.dev', date: 1717286400000, isActive: false, mostUsedModel: null, composerRequests: 0, chatRequests: 0, agentRequests: 0, cmdkUsages: 0, totalApplies: 0, totalAccepts: 0, totalTabsShown: 0, totalTabsAccepted: 0, usageBasedReqs: 0, apiKeyReqs: 0, subscriptionIncludedReqs: 0 },
        { userId: 7, email: 'chris@acme.dev', date: 1717286400000, isActive: false, mostUsedModel: null, composerRequests: 0, chatRequests: 0, agentRequests: 0, cmdkUsages: 0, totalApplies: 0, totalAccepts: 0, totalTabsShown: 0, totalTabsAccepted: 0, usageBasedReqs: 0, apiKeyReqs: 0, subscriptionIncludedReqs: 0 },
      ],
      period: { startDate: 1717200000000, endDate: 1717286400000 },
    },
  },
  null,
  2,
);
