// programs/496-unite-with-delta-and-secure-spawner.js
console.log('=== Program 496: Unite with Delta at Spawner Front ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('delta: Alpha is stationed at the end of the covered tunnel (44, 65, -172)! Ready to receive tools & build spawner box!');

// 1. Wait for Delta and pick up any dropped items
for (let wait = 0; wait < 30; wait++) {
  if (isCancelled()) break;
  await sleep(1000);

  // Pick up any items that come in reach
  const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 6);
  if (items.length > 0) {
    try { await lib.pickup(6); } catch (e) {}
  }

  // Check if Delta is in visual range
  const delta = bot.players.delta?.entity;
  if (delta) {
    const dist = bot.entity.position.distanceTo(delta.position);
    console.log(`Delta arrived! Distance: ${dist.toFixed(1)}m at ${lib.fmt(delta.position)}`);
    if (dist < 4) {
      console.log('Delta united with Alpha at tunnel front!');
      break;
    }
  }

  // Defend against any Blazes in range through firing slit
  for (const ent of Object.values(bot.entities)) {
    if (ent.name === 'blaze' && ent.position.distanceTo(bot.entity.position) < 4.5) {
      console.log(`Blaze in melee range (${ent.position.distanceTo(bot.entity.position).toFixed(1)}m)! Slashing...`);
      await lib.equipWeapon();
      bot.attack(ent);
      await sleep(650);
      await lib.pickup(4);
    }
  }
}

await lib.equipWeapon();
await lib.equipArmor();

console.log('STATUS SUMMARY:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Blaze Rods:', lib.count('blaze_rod'));

const spawner = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawner);
bot.chat(`team: Alpha status: HP ${bot.health}/20, Tools: ${JSON.stringify(lib.tools())}, Blaze Rods: ${lib.count('blaze_rod')}, Dist to Spawner: ${dist.toFixed(1)}m!`);
