// programs/497-meet-delta-and-secure-gear.js
console.log('=== Program 497: Meet Delta & Arm for Spawner Assault ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('delta: Alpha waiting at covered tunnel head (44, 65, -172)! Toss stone sword when you arrive!');

// Wait for Delta and monitor arrivals
for (let sec = 0; sec < 35; sec++) {
  if (isCancelled()) break;
  await sleep(1000);

  // Pick up any items that come in reach
  const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
  if (items.length > 0) {
    console.log(`Found ${items.length} items in reach, picking up...`);
    try { await lib.pickup(8); } catch (e) {}
  }

  // Check Delta
  const delta = bot.players.delta?.entity;
  if (delta) {
    const d = bot.entity.position.distanceTo(delta.position);
    console.log(`Delta distance: ${d.toFixed(1)}m at ${lib.fmt(delta.position)}`);
    if (d < 5) {
      console.log('Delta is here with Alpha!');
      bot.chat('team: Delta & Alpha united at tunnel front (44, 65, -172)!');
      await sleep(1500);
      try { await lib.pickup(8); } catch (e) {}
      break;
    }
  }

  // Defend against any hostiles that get close
  for (const ent of Object.values(bot.entities)) {
    if (['blaze', 'wither_skeleton'].includes(ent.name) && ent.position.distanceTo(bot.entity.position) < 4.5) {
      console.log(`Hostile ${ent.name} in melee reach (${ent.position.distanceTo(bot.entity.position).toFixed(1)}m)! Slashing...`);
      await lib.equipWeapon();
      bot.attack(ent);
      await sleep(600);
      await lib.pickup(4);
    }
  }
}

await lib.equipWeapon();
await lib.equipArmor();

console.log('STATUS:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));
console.log('Blaze Rods:', lib.count('blaze_rod'));

const spawner = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawner);
bot.chat(`team: Alpha status: HP ${bot.health}/20, Tools: ${JSON.stringify(lib.tools())}, Blaze Rods: ${lib.count('blaze_rod')}, Dist to Spawner: ${dist.toFixed(1)}m!`);
