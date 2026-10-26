// programs/439-craft-gear-and-enter-mountain-tunnel.js
console.log('=== Program 439: Craft Tools & Enter Mountain Tunnel to Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Craft wooden pickaxe and wooden sword from logs
try {
  if (lib.count('*_log') > 0) {
    const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
    await lib.craft(log.replace('_log', '_planks'), 8);
    console.log('Crafted planks! Count:', lib.count('*_planks'));
  }
  if (lib.count('wooden_pickaxe') === 0 && lib.count('*_planks') >= 3) {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe!');
  }
  if (lib.count('wooden_sword') === 0 && lib.count('*_planks') >= 2) {
    await lib.craft('wooden_sword', 1);
    console.log('Crafted wooden_sword!');
  }
} catch (e) {
  console.log('Craft note:', e.message);
}

await lib.equipWeapon();
console.log('Inventory after crafting:', JSON.stringify(lib.inv()));

// 2. Announce entrance to mountain
bot.chat('team: Alpha armed with pickaxe & sword! Stepping into the mountain breach at (44, 65, -149) to dig tunnel to Blaze Spawner (32, 68, -190)!');

// 3. Move along completed bridge floor from z=-141 to z=-148
console.log('Moving across completed bridge to mountain face (44, 65, -148)...');
for (let z = -142; z >= -148; z--) {
  const floor = bot.blockAt(new Vec3(44, 64, z));
  console.log(`z=${z}: floor=${floor?.name || 'void'}`);
  if (floor && floor.name !== 'air') {
    try {
      await lib.goTo(44, 65, z, 0, { timeoutMs: 5000 });
    } catch (e) {
      await bot.lookAt(new Vec3(44, 65.5, z), true);
      bot.setControlState('forward', true);
      await sleep(350);
      bot.setControlState('forward', false);
    }
  } else {
    console.log(`Warning: floor at z=${z} is air! Stopping forward walk.`);
    break;
  }
}

console.log('Alpha reached bridge position:', lib.fmt(bot.entity.position));

// 4. Step into mountain breach at (44, 65, -149)
console.log('Entering mountain breach (44, 65, -149)...');
try {
  await lib.goTo(44, 65, -149, 1, { timeoutMs: 10000 });
} catch (e) {
  try { await lib.goToXZ(44, -149); } catch (e2) {}
}

console.log('Inside mountain rock at:', lib.fmt(bot.entity.position));

// 5. Dig tunnel forward through netherrack from z=-150 to z=-155
console.log('Digging 1x2 tunnel through mountain rock towards Blaze Spawner...');
for (let z = -150; z >= -155; z--) {
  if (isCancelled()) break;
  
  // Dig lower body (y=65) and upper head (y=66)
  for (const y of [65, 66]) {
    const targetBlock = bot.blockAt(new Vec3(44, y, z));
    if (targetBlock && targetBlock.name !== 'air') {
      try { await lib.dig(44, y, z); } catch (err) {}
    }
  }
  
  // Verify floor at y=64
  const fl = bot.blockAt(new Vec3(44, 64, z));
  if (!fl || fl.name === 'air') {
    const supp = bot.blockAt(new Vec3(44, 64, z + 1));
    if (supp) {
      const nr = bot.inventory.items().find(i => i.name === 'netherrack');
      if (nr) {
        try {
          await bot.equip(nr, 'hand');
          await bot.placeBlock(supp, new Vec3(0, 0, -1));
        } catch (e) {}
      }
    }
  }

  // Step forward
  await bot.lookAt(new Vec3(44, 65.5, z), true);
  bot.setControlState('forward', true);
  await sleep(400);
  bot.setControlState('forward', false);
  console.log(`Dug to z=${z}. Pos:`, lib.fmt(bot.entity.position));
}

await lib.pickup(6);
console.log('Alpha final position:', lib.fmt(bot.entity.position));
console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));

const spawnerDist = bot.entity.position.distanceTo(new Vec3(32, 68, -190));
bot.chat(`team: Alpha inside mountain tunnel at ${lib.fmt(bot.entity.position)}! Distance to Blaze Spawner: ${spawnerDist.toFixed(1)}m. Netherracks mined: ${lib.count('netherrack')}.`);
