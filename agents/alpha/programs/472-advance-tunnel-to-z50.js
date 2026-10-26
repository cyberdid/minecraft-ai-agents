// programs/472-advance-tunnel-to-z50.js
console.log('=== Program 472: Advance Ridge Tunnel z=-26 to z=-50 ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Helper to clear fire in path
async function clearFire() {
  const fires = bot.findBlocks({
    matching: b => b.name === 'fire' || b.name === 'soul_fire',
    maxDistance: 6,
    count: 6
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b);
    } catch (e) {}
  }
}

const startZ = Math.round(bot.entity.position.z);
console.log(`Advancing tunnel North from z=${startZ} to z=-50...`);

for (let z = startZ - 1; z >= -50; z--) {
  if (isCancelled()) break;

  await clearFire();

  // 1. Ensure solid floor underfoot at y=64
  const floor = bot.blockAt(new Vec3(63, 64, z));
  if (!floor || floor.name === 'air' || floor.name === 'cave_air' || floor.name.includes('fire')) {
    try {
      const mat = bot.inventory.items().find(i => ['soul_sand', 'soul_soil', 'netherrack', 'cobblestone', 'dirt'].includes(i.name));
      if (mat) await lib.place(mat.name, 63, 64, z);
    } catch (e) {}
  }

  // 2. Clear head at y=66 if blocked
  const head = bot.blockAt(new Vec3(63, 66, z));
  if (head && head.name !== 'air' && head.name !== 'cave_air') {
    try {
      await bot.dig(head);
    } catch (e) {}
  }

  // 3. Clear feet at y=65 if blocked
  const feet = bot.blockAt(new Vec3(63, 65, z));
  if (feet && feet.name !== 'air' && feet.name !== 'cave_air') {
    try {
      await bot.dig(feet);
    } catch (e) {}
  }

  // 4. Step forward into z
  try {
    await bot.lookAt(new Vec3(63.5, 65.0, z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(350);
    bot.setControlState('forward', false);
  } catch (e) {}

  await lib.pickup(4);

  if (z % 5 === 0) {
    console.log(`Reached z=${z}! Pos: ${lib.fmt(bot.entity.position)}`);
  }
}

console.log('Tunnel advance complete! Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha tunnel advanced to ${lib.fmt(bot.entity.position)}! Partnering with Gamma to reach Fortress Workshop!`);
