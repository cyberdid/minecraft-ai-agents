// programs/495-scan-and-recover-items.js
console.log('=== Program 495: Scan & Recover Items at Spawner Front ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Scan for all dropped items within 24m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 24);
console.log(`Found ${items.length} dropped items within 24m:`);
for (const it of items) {
  const d = it.position.distanceTo(bot.entity.position);
  console.log(`- Item at ${lib.fmt(it.position)} (dist ${d.toFixed(1)}m)`);
}

// 2. Pick up items in safe reach (< 6m)
if (items.length > 0) {
  for (const it of items) {
    if (it.position.distanceTo(bot.entity.position) <= 6) {
      console.log(`Picking up item at ${lib.fmt(it.position)}...`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 1));
        await lib.pickup(4);
      } catch (e) {}
    }
  }
}

// 3. Equip whatever tools/armor we picked up
await lib.equipWeapon();
await lib.equipArmor();

console.log('Alpha tools:', JSON.stringify(lib.tools()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));

// 4. Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

const spawner = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawner);
bot.chat(`team: Alpha at (44, 65, -172)! HP: ${bot.health}, Tools: ${JSON.stringify(lib.tools())}, Dist to Spawner: ${dist.toFixed(1)}m. Sheltered inside covered tunnel!`);
