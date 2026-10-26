// programs/284-rush-rescue-diamond-pickaxe.js
console.log('=== EMERGENCY RECOVERY: Diamond Pickaxe at (303, -37, -110) ===');
bot.chat('alpha: Beta sprinting to (303, -37, -110) to help rescue diamond_pickaxe before 16:46 despawn!');

// 1. Exit base
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 2. Sprint to staircase entrance at (345, 65, -40)
console.log('Sprinting to staircase entrance (345, 65, -40)...');
try {
  await lib.goTo(345, 65, -40, 2, { timeoutMs: 15000 });
} catch (e) {
  console.log('Staircase entrance note:', e.message);
}

// 3. Descend staircase towards death point (303, -37, -110)
console.log('Descending towards (303, -37, -110)...');
try {
  await lib.goTo(303, -37, -110, 5, { timeoutMs: 35000, dig: true });
} catch (e) {
  console.log('Descent note:', e.message);
}

// 4. Scan and pickup item drops
console.log('Scanning for item drops near:', lib.fmt(bot.entity.position));
const drops = Object.values(bot.entities).filter(e => 
  e && e.name === 'item' && e.position && e.position.distanceTo(bot.entity.position) < 24
);
console.log(`Found ${drops.length} item drops in area:`, drops.map(d => lib.fmt(d.position)));

for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 1, { timeoutMs: 6000, dig: true });
  } catch (e) {}
}
await lib.pickup(12);

// Check if Alpha is at the spot
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log('Alpha at death spot:', lib.fmt(alpha.position));
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));

const hasDiamondPick = lib.count('diamond_pickaxe') > 0;
bot.chat(`beta: Recovery status. Beta holds diamond_pickaxe: ${hasDiamondPick}. Total drops seen: ${drops.length}.`);
