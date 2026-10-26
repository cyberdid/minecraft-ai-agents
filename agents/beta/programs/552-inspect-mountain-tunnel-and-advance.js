// programs/552-inspect-mountain-tunnel-and-advance.js
console.log('=== Step: Inspect Mountain Tunnel, Advance Towards Blaze Spawner ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan for item drops within 15m
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 15);
console.log(`Found ${drops.length} item drops nearby`);
for (const d of drops) {
  console.log(`Drop at ${lib.fmt(d.position)}`);
  try { await lib.goTo(d.position.x, d.position.y, d.position.z, 0.5); } catch (e) {}
}
await lib.pickup(10);

// Check if we picked up any weapon or pickaxe
await lib.equipWeapon();
console.log('Inventory now:', bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ') || 'empty');

// 2. Scan tunnel ahead from z=-157 down to z=-175
console.log('Scanning tunnel path from z=-157 to z=-175:');
let curX = 44;
let curY = 65;
for (let z = -157; z >= -175; z--) {
  const bFeet = bot.blockAt(new Vec3(curX, curY, z));
  const bHead = bot.blockAt(new Vec3(curX, curY + 1, z));
  const bFloor = bot.blockAt(new Vec3(curX, curY - 1, z));
  console.log(`z=${z}: floor=${bFloor?.name}, feet=${bFeet?.name}, head=${bHead?.name}`);
}

// 3. Check for Blazes and their positions
const hostiles = lib.hostiles(25);
console.log('Hostiles within 25m:', hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`).join(', ') || 'none');

// 4. Advance forward along the tunnel to z=-165
console.log('Advancing deeper into mountain tunnel towards z=-165...');
for (let z = -158; z >= -165; z--) {
  if (isCancelled()) break;
  // If feet or head blocked, dig through (netherrack takes 0.6s by hand)
  const feet = bot.blockAt(new Vec3(curX, curY, z));
  const head = bot.blockAt(new Vec3(curX, curY + 1, z));
  if (feet && feet.boundingBox === 'block') {
    try { await lib.dig(curX, curY, z); } catch (e) {}
  }
  if (head && head.boundingBox === 'block') {
    try { await lib.dig(curX, curY + 1, z); } catch (e) {}
  }
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(curX, curY, z));
    console.log(`Stepped forward to z=${z}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {}
}

await lib.pickup(6);
console.log('Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Report in chat
const blazeHostile = lib.hostiles(20).find(h => h.name === 'blaze');
bot.chat(`beta: At ${lib.fmt(bot.entity.position)} in mountain tunnel! Blaze distance: ${blazeHostile ? blazeHostile.dist.toFixed(1) + 'm' : 'not in range'}. Approaching spawner at (32, 68, -190)!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  inventory: bot.inventory.items().map(i => `${i.name}x${i.count}`)
};
