// programs/486-advance-to-blaze-spawner-balcony.js
console.log('=== Program 486: Advance to Blaze Spawner Balcony (32, 68, -190) ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

const spawnerPos = new Vec3(32, 68, -190);
console.log(`Target Blaze Spawner at: ${lib.fmt(spawnerPos)}`);

// Diagonal staircasing approach from (44, 65, -174) to (32, 68, -188)
const approachSteps = [
  { x: 43, y: 65, z: -176 },
  { x: 41, y: 65, z: -178 },
  { x: 39, y: 66, z: -180 },
  { x: 37, y: 66, z: -182 },
  { x: 35, y: 67, z: -184 },
  { x: 34, y: 67, z: -186 },
  { x: 32, y: 68, z: -188 }  // 2 blocks South of spawner at (32, 68, -190)
];

bot.chat('team: Alpha advancing diagonal walkway directly to Blaze Spawner at (32, 68, -190)!');

for (const step of approachSteps) {
  if (isCancelled()) break;
  const { x, y, z } = step;

  console.log(`Approaching step (${x}, ${y}, ${z})...`);

  // 1. Ensure solid floor underfoot at y-1
  let floor = bot.blockAt(new Vec3(x, y - 1, z));
  if (!floor || floor.name === 'air' || floor.name === 'cave_air' || floor.name === 'lava') {
    try {
      const mat = bot.inventory.items().find(i => ['netherrack', 'cobblestone', 'soul_sand', 'dirt', 'oak_planks'].includes(i.name));
      if (mat) {
        await lib.place(mat.name, x, y - 1, z);
        console.log(`Placed floor at (${x}, ${y - 1}, ${z})`);
      }
    } catch (e) {}
  }

  // 2. Clear head block at y+1
  const head = bot.blockAt(new Vec3(x, y + 1, z));
  if (head && head.name !== 'air' && head.name !== 'cave_air') {
    try {
      const p = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (p) await bot.equip(p, 'hand');
      await bot.dig(head);
    } catch (e) {}
  }

  // 3. Clear feet block at y
  const feet = bot.blockAt(new Vec3(x, y, z));
  if (feet && feet.name !== 'air' && feet.name !== 'cave_air') {
    try {
      const p = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (p) await bot.equip(p, 'hand');
      await bot.dig(feet);
    } catch (e) {}
  }

  // 4. Step safely into position
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

  // Check for nearby Blazes and strike through firing slit
  for (const ent of Object.values(bot.entities)) {
    if (ent.name === 'blaze' && ent.position.distanceTo(bot.entity.position) < 4.5) {
      console.log(`Blaze in range (${ent.position.distanceTo(bot.entity.position).toFixed(1)}m)! Slashing...`);
      await lib.equipWeapon();
      bot.attack(ent);
      await sleep(650);
      await lib.pickup(4);
    }
  }

  const dist = bot.entity.position.distanceTo(spawnerPos);
  console.log(`Current pos: ${lib.fmt(bot.entity.position)}, Dist to Spawner: ${dist.toFixed(1)}m`);
  if (dist <= 3) {
    console.log('*** AT BLAZE SPAWNER BALCONY! ***');
    break;
  }
}

// Check for Blaze Rods in inventory
const blazeRods = lib.count('blaze_rod');
console.log('Blaze Rods in inventory:', blazeRods);

await lib.equipWeapon();
const finalDist = bot.entity.position.distanceTo(spawnerPos);
console.log('FINAL STATUS:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log(`Distance to Blaze Spawner: ${finalDist.toFixed(1)}m`);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha at Blaze Spawner balcony ${lib.fmt(bot.entity.position)}! Dist: ${finalDist.toFixed(1)}m, Blaze Rods: ${blazeRods}!`);
