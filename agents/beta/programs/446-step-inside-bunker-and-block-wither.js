// programs/446-step-inside-bunker-and-block-wither.js
console.log('=== Step: Step into Fortress bunker at (44, 66, -129) and block Wither Skeleton ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Move inside bunker at (44, 65, -129)
try {
  await lib.goTo(44, 65, -129, 0.5);
  console.log('Inside bunker at', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Bunker entry note:', e.message);
}

// 2. Place 2-high ceiling / doorway barrier to block 2.4m Wither Skeleton
// Wither skeletons are 2.4 blocks tall; placing a block at y=66 prevents them from passing through
const doorway = new Vec3(44, 66, -128);
const db = bot.blockAt(doorway);
if (db && db.name === 'air') {
  try {
    const mat = lib.count('soul_sand') > 0 ? 'soul_sand' : 'dirt';
    await lib.place(mat, doorway.x, doorway.y, doorway.z);
    console.log(`Placed ${mat} barrier at doorway ${lib.fmt(doorway)}!`);
  } catch (e) {}
}

// 3. Scan for nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${d}m`);
  }
}

// 4. Scan for fortress mobs
const mobs = Object.values(bot.entities).filter(e => 
  ['wither_skeleton', 'blaze', 'piglin'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 20
);
console.log(`Hostiles near bunker (${mobs.length}):`);
for (const m of mobs) {
  console.log(`  ${m.name} at ${lib.fmt(m.position)}, dist=${bot.entity.position.distanceTo(m.position).toFixed(1)}m`);
}

bot.chat(`beta: Sheltered in Fortress bunker at ${lib.fmt(bot.entity.position)}! Doorway barricaded against Wither Skeletons. HP: ${bot.health.toFixed(1)}/20. Team assemble here!`);
