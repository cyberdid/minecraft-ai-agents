// programs/808-step-into-bunker.js
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Equip iron sword
const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sword) await bot.equip(sword, 'hand');

// Defend if hoglin is within 3m
const hostiles = lib.hostiles(3.5);
for (const h of hostiles) {
  if (h.entity) {
    console.log(`Defending against ${h.name} at ${lib.fmt(h.position)}...`);
    bot.attack(h.entity);
    await sleep(400);
  }
}

// Inspect path to (44, 65, -128)
console.log('Blocks leading to bunker:');
for (let z = -123; z >= -128; z--) {
  for (let y = 60; y <= 66; y++) {
    const b = bot.blockAt(new Vec3(44, y, z));
    if (b && b.name !== 'air' && b.name !== 'cave_air') {
      console.log(`(44, ${y}, ${z}): ${b.name}`);
    }
  }
}
