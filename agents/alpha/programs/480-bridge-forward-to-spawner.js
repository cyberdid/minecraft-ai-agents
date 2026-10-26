// programs/480-bridge-forward-to-spawner.js
console.log('=== Program 480: Bridge Floor & Advance North to Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.chat('team: Alpha bridging solid floor along x=44 towards Blaze Spawner (32, 68, -190)!');

for (let z = -163; z >= -175; z--) {
  if (isCancelled()) break;
  console.log(`Checking bridge segment at (44, 64..66, ${z})...`);

  // 1. Ensure solid floor underfoot at y=64
  let floor = bot.blockAt(new Vec3(44, 64, z));
  if (!floor || floor.name === 'air' || floor.name === 'cave_air') {
    console.log(`Placing floor block at (44, 64, ${z})...`);
    try {
      const mat = bot.inventory.items().find(i => ['soul_sand', 'cobblestone', 'netherrack', 'dirt'].includes(i.name));
      if (!mat) {
        console.log('Out of bridging material!');
        break;
      }
      await lib.place(mat.name, 44, 64, z);
      console.log(`Placed ${mat.name} at (44, 64, ${z})!`);
    } catch (err) {
      console.log(`Place error at z=${z}:`, err.message);
    }
  }

  // 2. Clear head block if obstructed
  const head = bot.blockAt(new Vec3(44, 66, z));
  if (head && head.name !== 'air' && head.name !== 'cave_air') {
    try {
      const p = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (p) await bot.equip(p, 'hand');
      await bot.dig(head);
    } catch (e) {}
  }

  // 3. Clear feet block if obstructed
  const feet = bot.blockAt(new Vec3(44, 65, z));
  if (feet && feet.name !== 'air' && feet.name !== 'cave_air') {
    try {
      const p = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (p) await bot.equip(p, 'hand');
      await bot.dig(feet);
    } catch (e) {}
  }

  // 4. Step safely onto newly placed floor
  floor = bot.blockAt(new Vec3(44, 64, z));
  if (floor && floor.boundingBox === 'block') {
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(44, 65, z));
      console.log(`Advanced safely to (44, 65, ${z})!`);
    } catch (e) {
      await bot.lookAt(new Vec3(44.5, 64.0, z + 0.5), true);
      bot.setControlState('forward', true);
      await sleep(350);
      bot.setControlState('forward', false);
    }
  } else {
    console.log(`Warning: floor at z=${z} is not solid (${floor?.name}), not stepping forward!`);
    break;
  }

  await lib.pickup(4);

  const spawner = new Vec3(32, 68, -190);
  const dist = bot.entity.position.distanceTo(spawner);
  console.log(`Current pos: ${lib.fmt(bot.entity.position)}, Distance to Spawner: ${dist.toFixed(1)}m`);
}

await lib.equipWeapon();
const spawnerTarget = new Vec3(32, 68, -190);
const finalDist = bot.entity.position.distanceTo(spawnerTarget);
console.log('SUMMARY:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Distance to Blaze Spawner:', finalDist.toFixed(1) + 'm');
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha bridged to ${lib.fmt(bot.entity.position)}! Only ${finalDist.toFixed(1)}m to Blaze Spawner (32, 68, -190)!`);
