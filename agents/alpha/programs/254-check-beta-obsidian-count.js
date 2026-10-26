// programs/254-check-beta-obsidian-count.js
console.log('=== Program 254: Check Beta Obsidian & Guide to Portal ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('beta: What is your obsidian count? I am at y=21 in the tunnel. When you have 10, let us head to (298, 72, -54) to light the portal!');

// Check Beta position and held item
if (bot.players.beta?.entity) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', lib.fmt(b.position), 'held:', b.heldItem?.name);
}

// Move south along tunnel towards Beta (281, 19, 12)
console.log('Moving towards Beta at (281, 19, 12)...');
const stages = [
  { x: 327, y: 19, z: -40 },
  { x: 305, y: 19, z: -15 },
  { x: 285, y: 19, z: 10 }
];

for (const st of stages) {
  if (isCancelled()) break;
  try {
    await lib.goTo(st.x, st.y, st.z, 3, { timeoutMs: 15000 });
    console.log(`Reached tunnel stage at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {}
}

await lib.pickup(6);

console.log('Alpha pos now:', lib.fmt(bot.entity.position), 'Obsidian on Alpha:', lib.count('obsidian'));
