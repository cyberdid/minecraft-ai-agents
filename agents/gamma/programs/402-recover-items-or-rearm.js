// programs/402-recover-items-or-rearm.js
console.log('=== ITEM RECOVERY / REARM CHECK ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Find dropped items within 16 blocks
const items = Object.values(bot.entities).filter(e => e && (e.name === 'item' || e.entityType === 1) && e.position.distanceTo(bot.entity.position) < 16);
console.log(`Found ${items.length} dropped items nearby:`);
for (const it of items) {
  console.log(`- Item at ${lib.fmt(it.position)}, dist: ${it.position.distanceTo(bot.entity.position).toFixed(1)}`);
}

// Check if items are right below us at (299.5, 58, -53.6)
const deathPos = new Vec3(299.5, 58.0, -53.6);
const distToDeath = bot.entity.position.distanceTo(deathPos);
console.log(`Distance to death pos: ${distToDeath.toFixed(1)}`);

// Can we safely pathfind down with dig=false or dig=true with safety?
// Or better: let pathfinder find a safe walking path (it avoids drops > 3 blocks unless safe)
if (items.length > 0) {
  console.log('Attempting safe path to recover items...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(deathPos.x, deathPos.y, deathPos.z, 1));
    console.log('Reached death spot! Picking up items...');
    await sleep(500);
    await lib.pickup(8);
  } catch (err) {
    console.log('Pathfind to items error:', err.message);
  }
}

console.log('Current inv:', JSON.stringify(lib.inv()));
console.log('Current pos:', lib.fmt(bot.entity.position));
console.log('Current status:', JSON.stringify(lib.status()));
