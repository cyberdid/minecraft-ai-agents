// programs/484-join-delta-at-spawner-corridor.js
console.log('=== Program 484: Join Delta & Advance Corridor to Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Equip stone pickaxe / sword
await lib.equipWeapon();

// 2. Step forward through the covered tunnel to Delta at (44, 65, -163)
console.log('Stepping forward to Delta at (44, 65, -163)...');
for (let z = -157; z >= -163; z--) {
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(44, 65, z));
  } catch (e) {
    try {
      await bot.lookAt(new Vec3(44.5, 65.0, z), true);
      bot.setControlState('forward', true);
      await sleep(300);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }
}
console.log('Alpha joined Delta at:', lib.fmt(bot.entity.position));

// 3. Check Delta and other teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

// 4. Advance diagonally towards Blaze Spawner at (32, 68, -190)
// Step by step from (44, 65, -163) towards (32, 68, -188)
const spawnerSteps = [
  { x: 43, y: 65, z: -165 },
  { x: 42, y: 65, z: -167 },
  { x: 41, y: 65, z: -169 },
  { x: 40, y: 65, z: -171 },
  { x: 39, y: 65, z: -173 },
  { x: 38, y: 65, z: -175 },
  { x: 37, y: 66, z: -177 },
  { x: 36, y: 66, z: -179 },
  { x: 35, y: 67, z: -181 },
  { x: 34, y: 67, z: -183 },
  { x: 33, y: 68, z: -185 },
  { x: 32, y: 68, z: -187 }
];

bot.chat('team: Alpha & Delta advancing enclosed blast-proof walkway to Blaze Spawner at (32, 68, -190)!');

for (const step of spawnerSteps) {
  if (isCancelled()) break;
  const { x, y, z } = step;

  // Ensure solid floor underfoot at y-1
  let floor = bot.blockAt(new Vec3(x, y - 1, z));
  if (!floor || floor.name === 'air' || floor.name === 'cave_air') {
    try {
      const mat = bot.inventory.items().find(i => ['cobblestone', 'netherrack', 'soul_sand', 'dirt'].includes(i.name));
      if (mat) await lib.place(mat.name, x, y - 1, z);
    } catch (e) {}
  }

  // Clear head block at y+1
  const head = bot.blockAt(new Vec3(x, y + 1, z));
  if (head && head.name !== 'air' && head.name !== 'cave_air') {
    try {
      const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(head);
    } catch (e) {}
  }

  // Clear feet block at y
  const feet = bot.blockAt(new Vec3(x, y, z));
  if (feet && feet.name !== 'air' && feet.name !== 'cave_air') {
    try {
      const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(feet);
    } catch (e) {}
  }

  // Step forward
  floor = bot.blockAt(new Vec3(x, y - 1, z));
  if (floor && floor.boundingBox === 'block') {
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(x, y, z));
      console.log(`Advanced to (${x}, ${y}, ${z})!`);
    } catch (e) {
      await bot.lookAt(new Vec3(x + 0.5, y, z + 0.5), true);
      bot.setControlState('forward', true);
      await sleep(350);
      bot.setControlState('forward', false);
    }
  }

  await lib.pickup(4);

  // Attack any Blazes in range through firing slit
  const blazes = bot.entities;
  for (const ent of Object.values(blazes)) {
    if (ent.name === 'blaze' && ent.position.distanceTo(bot.entity.position) < 4) {
      console.log(`Blaze in melee range (${ent.position.distanceTo(bot.entity.position).toFixed(1)}m)! Striking...`);
      await lib.equipWeapon();
      bot.attack(ent);
      await sleep(600);
      await lib.pickup(4);
    }
  }

  const distToSpawner = bot.entity.position.distanceTo(new Vec3(32, 68, -190));
  if (distToSpawner <= 3) {
    console.log(`*** AT BLAZE SPAWNER PLATFORM! Dist: ${distToSpawner.toFixed(1)}m ***`);
    break;
  }
}

await lib.equipWeapon();
const spawnerTarget = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawnerTarget);
console.log('Final position:', lib.fmt(bot.entity.position));
console.log(`Distance to Blaze Spawner: ${dist.toFixed(1)}m`);
console.log('Blaze Rods collected:', lib.count('blaze_rod'));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha at Blaze Spawner perimeter ${lib.fmt(bot.entity.position)}! Dist: ${dist.toFixed(1)}m, Blaze Rods: ${lib.count('blaze_rod')}. Slashing Blazes!`);
