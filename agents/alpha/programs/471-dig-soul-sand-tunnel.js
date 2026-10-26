// programs/471-dig-soul-sand-tunnel.js
console.log('=== Program 471: Dig Soul Sand Ridge Tunnel ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('team: Alpha, Beta & Gamma digging covered ridge tunnel through soul sand hill at z=-6..-20!');

for (let z = -6; z >= -22; z--) {
  if (isCancelled()) break;
  console.log(`Digging tunnel step at x=63, z=${z}...`);

  // Ensure solid floor underfoot at y=64
  const floor = bot.blockAt(new Vec3(63, 64, z));
  if (!floor || floor.name === 'air' || floor.name === 'cave_air' || floor.name === 'fire') {
    try {
      const mat = bot.inventory.items().find(i => ['soul_sand', 'netherrack', 'cobblestone', 'dirt'].includes(i.name));
      if (mat) await lib.place(mat.name, 63, 64, z);
    } catch (e) {}
  }

  // Dig head block at y=66
  const head = bot.blockAt(new Vec3(63, 66, z));
  if (head && head.name !== 'air' && head.name !== 'cave_air') {
    try {
      await bot.dig(head);
    } catch (e) {
      console.log(`Head dig error at z=${z}:`, e.message);
    }
  }

  // Dig feet block at y=65
  const feet = bot.blockAt(new Vec3(63, 65, z));
  if (feet && feet.name !== 'air' && feet.name !== 'cave_air') {
    try {
      await bot.dig(feet);
    } catch (e) {
      console.log(`Feet dig error at z=${z}:`, e.message);
    }
  }

  // Step forward into dug space
  try {
    await bot.lookAt(new Vec3(63.5, 65.0, z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  } catch (e) {}
  
  await lib.pickup(4);
}

console.log('Tunnel digging complete! Alpha pos:', lib.fmt(bot.entity.position));
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha opened soul sand tunnel to ${lib.fmt(bot.entity.position)}! Path to Fortress Workshop is clear!`);
