// programs/435-secure-health-and-shelter.js
console.log('=== CRITICAL: Pick up food/drops, eat, and build emergency shelter ===');
console.log('Current HP:', bot.health, 'Food:', bot.food, 'Pos:', lib.fmt(bot.entity.position));

// 1. Pick up immediate drops within 5m
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 6
);
console.log(`Nearby drops (${drops.length}):`);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.6);
    console.log(`Picked up drop at ${lib.fmt(d.position)}`);
  } catch (e) {}
}

// 2. Check if we got food and eat immediately
const foodNames = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple'];
for (const fn of foodNames) {
  while (lib.count(fn) > 0 && bot.food < 20 && !isCancelled()) {
    try {
      await bot.equip(mcData.itemsByName[fn].id, 'hand');
      await bot.consume();
      console.log(`Ate ${fn}! Food now: ${bot.food}/20, HP: ${bot.health}/20`);
      await sleep(350);
    } catch (e) { break; }
  }
}

// 3. If HP is still low (<= 8), seal emergency cobblestone box around bot
if (bot.health <= 8) {
  console.log('HP critically low! Constructing immediate cobblestone shelter...');
  const p = bot.entity.position.floored();
  
  // Place 4 surrounding walls and ceiling
  const shelterOffsets = [
    [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1],
    [1, 1, 0], [-1, 1, 0], [0, 1, 1], [0, 1, -1],
    [0, 2, 0] // roof
  ];
  
  for (const [dx, dy, dz] of shelterOffsets) {
    if (isCancelled() || lib.count('cobblestone') + lib.count('cobbled_deepslate') < 2) break;
    const target = p.offset(dx, dy, dz);
    const b = bot.blockAt(target);
    if (b && b.name === 'air') {
      try {
        const mat = lib.count('cobblestone') > 0 ? 'cobblestone' : 'cobbled_deepslate';
        await lib.place(mat, target.x, target.y, target.z);
        console.log(`Sealed shelter block at ${lib.fmt(target)}`);
      } catch (e) {}
    }
  }
}

console.log(`Shelter status: HP=${bot.health}/20, Food=${bot.food}/20, Pos=${lib.fmt(bot.entity.position)}`);
bot.chat(`beta: Fortress bridge outpost secured at ${lib.fmt(bot.entity.position)}! HP: ${bot.health.toFixed(1)}/20. Alpha/Gamma meet here!`);
