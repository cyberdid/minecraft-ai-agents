// programs/091-find-shaft-and-ascend.js
console.log('--- FIND SHAFT & ASCEND TO SURFACE ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Mine 16 more cobblestone right here so we have plenty of blocks
await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
const p = bot.entity.position.floored();

for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    if (lib.count('cobblestone') >= 20) break;
    const target = p.offset(dx, 0, dz);
    const b = bot.blockAt(target);
    if (b && (b.name === 'stone' || b.name === 'diorite' || b.name === 'granite')) {
      try {
        await lib.dig(target.x, target.y, target.z);
        await sleep(150);
        await lib.pickup(4);
      } catch (e) {}
    }
  }
}

console.log('Cobblestone count now:', lib.count('cobblestone'));

// 2. Scan for air/shaft blocks towards (302, y, -44)
console.log('Scanning for open air towards (302, -44)...');
const airs = bot.findBlocks({
  matching: b => b && (b.name === 'air' || b.name === 'cave_air') && b.position.y >= 48,
  maxDistance: 24,
  count: 50
}).filter(pt => pt.x <= 316 && pt.z <= -34);

console.log(`Found ${airs.length} walkable air points in shaft direction`);

// 3. Set movements with canDig = true and high digCost
const m = new Movements(bot);
m.canDig = true;
m.allow1by1towers = true;
m.allowSprinting = true;
m.allowParkour = false;
bot.pathfinder.setMovements(m);

// Navigate to shaft base at (302, 52, -44)
console.log('Navigating to shaft base (302, 52, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(302, 52, -44, 2));
  console.log('Reached shaft base at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft base note:', e.message);
}

// Climb up shaft to (302, 71, -44)
console.log('Climbing shaft to surface (302, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 1));
  console.log('REACHED SURFACE AT:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft surface climb note:', e.message);
}

console.log('Current pos:', lib.fmt(bot.entity.position));
bot.chat(`gamma at ${lib.fmt(bot.entity.position)}. Heading to Nether portal!`);
