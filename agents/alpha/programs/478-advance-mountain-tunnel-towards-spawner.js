// programs/478-advance-mountain-tunnel-towards-spawner.js
console.log('=== Program 478: Advance Mountain Tunnel to Blaze Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Equip stone pickaxe
const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (pick) await bot.equip(pick, 'hand');

// Tunnel waypoints heading directly towards Blaze Spawner at (32, 68, -190)
const tunnelPath = [
  { x: 44, y: 65, z: -160 },
  { x: 43, y: 65, z: -162 },
  { x: 42, y: 65, z: -164 },
  { x: 41, y: 65, z: -166 },
  { x: 40, y: 65, z: -168 },
  { x: 39, y: 65, z: -170 },
  { x: 38, y: 65, z: -172 },
  { x: 37, y: 65, z: -174 },
  { x: 36, y: 65, z: -176 },
  { x: 35, y: 66, z: -178 }, // start staircasing up
  { x: 34, y: 66, z: -180 },
  { x: 33, y: 67, z: -182 },
  { x: 33, y: 67, z: -184 },
  { x: 32, y: 68, z: -186 }, // reach y=68 balcony level
  { x: 32, y: 68, z: -188 }  // 2 blocks back from spawner at (32, 68, -190)!
];

bot.chat('team: Alpha advancing mountain tunnel directly towards Blaze Spawner at (32, 68, -190)!');

for (const step of tunnelPath) {
  if (isCancelled()) break;
  const { x, y, z } = step;

  console.log(`Advancing to (${x}, ${y}, ${z})...`);

  // Ensure solid floor underfoot at y-1
  const floor = bot.blockAt(new Vec3(x, y - 1, z));
  if (!floor || floor.name === 'air' || floor.name === 'cave_air') {
    try {
      const mat = bot.inventory.items().find(i => ['netherrack', 'soul_sand', 'cobblestone', 'dirt'].includes(i.name));
      if (mat) await lib.place(mat.name, x, y - 1, z);
    } catch (e) {}
  }

  // Dig head block at y+1
  const head = bot.blockAt(new Vec3(x, y + 1, z));
  if (head && head.name !== 'air' && head.name !== 'cave_air') {
    try {
      const p = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (p) await bot.equip(p, 'hand');
      await bot.dig(head);
    } catch (e) {}
  }

  // Dig feet block at y
  const feet = bot.blockAt(new Vec3(x, y, z));
  if (feet && feet.name !== 'air' && feet.name !== 'cave_air') {
    try {
      const p = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (p) await bot.equip(p, 'hand');
      await bot.dig(feet);
    } catch (e) {}
  }

  // Step forward
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(x, y, z));
    console.log(`Stepped to (${x}, ${y}, ${z})!`);
  } catch (e) {
    try {
      await bot.lookAt(new Vec3(x + 0.5, y, z + 0.5), true);
      bot.setControlState('forward', true);
      await sleep(350);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }

  await lib.pickup(4);

  // Check distance to Blaze Spawner
  const dist = bot.entity.position.distanceTo(new Vec3(32, 68, -190));
  if (dist <= 4) {
    console.log(`*** REACHED BLAZE SPAWNER PERIMETER! Dist: ${dist.toFixed(1)}m ***`);
    break;
  }
}

await lib.equipWeapon();
const spawnerTarget = new Vec3(32, 68, -190);
const finalDist = bot.entity.position.distanceTo(spawnerTarget);
console.log('Final position:', lib.fmt(bot.entity.position));
console.log(`Distance to Blaze Spawner: ${finalDist.toFixed(1)}m`);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha reached Blaze Spawner perimeter ${lib.fmt(bot.entity.position)}! Only ${finalDist.toFixed(1)}m to Spawner (32, 68, -190)! Building battlements box!`);
