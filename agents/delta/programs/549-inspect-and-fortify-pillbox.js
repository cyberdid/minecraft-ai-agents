// programs/549-inspect-and-fortify-pillbox.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: INSPECT & FORTIFY PILLBOX ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Cobble: ${lib.count('cobblestone')}`);

// 1. Inspect blocks in the front wall at x=36
console.log('--- PILLBOX WALL AT x=36 ---');
for (let z = -185; z >= -189; z--) {
  for (let y = 65; y <= 68; y++) {
    const b = bot.blockAt(new Vec3(36, y, z));
    console.log(`Block at (36, ${y}, ${z}): ${b ? b.name : 'null'}`);
  }
}

// 2. Fortify: ensure floor at y=65, guard block at (36, 66, -187) and roof at (36, 68, -187)
// Leave (36, 67, -187) as the 1-block melee slit
const targetSlit = new Vec3(36, 67, -187);
console.log(`Melee slit block is at ${lib.fmt(targetSlit)}: ${bot.blockAt(targetSlit)?.name}`);

// 3. Scan Blazes
const blazes = Object.values(bot.entities).filter(e =>
  e.name === 'blaze' && e.isValid && bot.entity.position.distanceTo(e.position) <= 4.5
);

if (blazes.length > 0) {
  console.log(`Striking Blaze at dist ${bot.entity.position.distanceTo(blazes[0].position).toFixed(1)}...`);
  await lib.equipWeapon();
  await bot.lookAt(blazes[0].position.offset(0, blazes[0].height * 0.6, 0), true);
  bot.attack(blazes[0]);
  await sleep(650);
}

// 4. Safe vacuum
try { await lib.pickup(3.0); } catch (e) {}

console.log('=== PILLBOX STATUS ===');
console.log(`HP: ${bot.health}, Rods: ${lib.count('blaze_rod')}, Pearls: ${lib.count('ender_pearl')}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  rods: lib.count('blaze_rod'),
  cobble: lib.count('cobblestone'),
  inv: lib.inv()
};
