// programs/431-extend-bridge-forward.js
console.log('=== Program 431: Extend Bridge Towards Blaze Spawner ===');
console.log('Alpha start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Walk forward inside the hallway to the bridge front (44, 65, -138)
console.log('Moving to bridge front at (44, 65, -138)...');
try {
  await lib.goTo(44, 65, -138, 0, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo front note:', e.message);
  // Direct walk forward
  await bot.lookAt(new Vec3(44, 65, -138), true);
  bot.setControlState('forward', true);
  while (bot.entity.position.z > -137.5) {
    await sleep(100);
  }
  bot.setControlState('forward', false);
}

console.log('Current pos at bridge front:', lib.fmt(bot.entity.position));

// 2. Equip netherrack
const nr = bot.inventory.items().find(i => i.name === 'netherrack');
if (!nr) {
  console.log('Error: No netherrack in inventory!');
} else {
  await bot.equip(nr, 'hand');
  console.log(`Equipped netherrack. Count: ${nr.count}`);

  // 3. Extend floor from z=-140 to z=-144
  for (let z = -140; z >= -144; z--) {
    if (isCancelled() || lib.count('netherrack') < 4) break;
    const targetFloor = new Vec3(44, 64, z);
    const prevFloor = new Vec3(44, 64, z + 1);
    
    const curBlock = bot.blockAt(targetFloor);
    if (!curBlock || curBlock.name === 'air') {
      const support = bot.blockAt(prevFloor);
      if (support && support.name !== 'air') {
        console.log(`Placing floor at ${lib.fmt(targetFloor)} against ${support.name}...`);
        try {
          await bot.lookAt(targetFloor.offset(0.5, 0.5, 0.5), true);
          await bot.placeBlock(support, new Vec3(0, 0, -1));
          await sleep(250);
        } catch (err) {
          console.log(`Floor place err at z=${z}:`, err.message);
        }
      }
    } else {
      console.log(`Floor at z=${z} already exists: ${curBlock.name}`);
    }

    // Place left and right side parapet walls at y=65 for blast protection
    for (const xOffset of [-1, 1]) {
      const sidePos = new Vec3(44 + xOffset, 65, z);
      const sideFloor = bot.blockAt(new Vec3(44 + xOffset, 64, z));
      const curSide = bot.blockAt(sidePos);
      if (!curSide || curSide.name === 'air') {
        try {
          const placeTarget = bot.blockAt(targetFloor);
          if (placeTarget && placeTarget.name !== 'air') {
            await bot.placeBlock(placeTarget, new Vec3(xOffset, 0, 0));
            await sleep(150);
          }
        } catch (e) {}
      }
    }

    // Step forward if floor successfully placed
    if (bot.blockAt(targetFloor)?.name !== 'air' && bot.entity.position.z > z + 1.2) {
      await bot.lookAt(new Vec3(44, 65, z), true);
      bot.setControlState('forward', true);
      await sleep(350);
      bot.setControlState('forward', false);
    }
  }
}

console.log('Alpha final pos:', lib.fmt(bot.entity.position));
console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha extended bridge floor to ${lib.fmt(bot.entity.position)}! Netherrack remaining: ${lib.count('netherrack')}. Advancing towards Blaze Spawner (32, 68, -190)!`);
