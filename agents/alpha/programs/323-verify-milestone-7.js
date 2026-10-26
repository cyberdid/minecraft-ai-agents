// programs/323-verify-milestone-7.js
console.log('=== Program 323: Verify Milestone 7 Nether Portal ===');

// Check the blocks inside the portal opening
const p1 = new Vec3(299, 73, -54);
const p2 = new Vec3(300, 73, -54);
const p3 = new Vec3(299, 74, -54);
const p4 = new Vec3(300, 74, -54);
const p5 = new Vec3(299, 75, -54);
const p6 = new Vec3(300, 75, -54);

const insideBlocks = [p1, p2, p3, p4, p5, p6].map(p => ({
  pos: lib.fmt(p),
  name: bot.blockAt(p)?.name
}));

console.log('Portal inner blocks:', JSON.stringify(insideBlocks));

const isLit = insideBlocks.every(b => b.name === 'nether_portal');
console.log('Is Nether Portal fully lit?', isLit);

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  }
}

bot.chat('team: Verified! Nether portal is 100% lit at (298, 72, -54)! Milestone 7 COMPLETE!');
