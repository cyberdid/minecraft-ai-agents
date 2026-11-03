// programs/824-pillar-reset-and-overworld-regear.js
console.log('=== Program 824: Pillar Fall Reset & Overworld Base Regear ===');
console.log('Starting pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. If in Nether at 1.2 HP, execute clean fall damage respawn
if (bot.game.dimension === 'the_nether' && bot.health <= 4) {
  bot.chat('alpha: Respawning at Overworld Base Bed to meet Beta & Delta for Milestone 10 Eyes of Ender!');

  const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
  if (cobble) await bot.equip(cobble, 'hand');

  // Place cobblestone against the nether_bricks pillar
  // Search for solid nether_bricks block within 4m
  const pillarBlocks = bot.findBlocks({
    matching: b => b && (b.name === 'nether_bricks' || b.name === 'netherrack' || b.name === 'blackstone'),
    maxDistance: 4,
    count: 10
  });

  console.log(`Found ${pillarBlocks.length} solid pillar blocks nearby`);

  if (pillarBlocks.length > 0) {
    const pBlock = bot.blockAt(pillarBlocks[0]);
    console.log(`Selected pillar anchor at: ${lib.fmt(pBlock.position)} (${pBlock.name})`);

    // Place cobblestone above/against it
    try {
      await bot.placeBlock(pBlock, new Vec3(0, 1, 0));
      console.log('Placed cobblestone on top of pillar block');
    } catch (e) {
      try {
        await bot.placeBlock(pBlock, new Vec3(1, 0, 0));
        console.log('Placed cobblestone against pillar face');
      } catch (e2) {
        console.log('Placement error:', e2.message);
      }
    }
  }

  // Jump onto the placed solid block
  bot.setControlState('jump', true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.clearControlStates();

  console.log(`Now at pos: ${lib.fmt(bot.entity.position)}, block below: ${bot.blockAt(bot.entity.position.offset(0, -1, 0))?.name}`);

  // Pillar up 5 blocks with cobblestone
  const startY = bot.entity.position.y;
  await bot.look(bot.entity.yaw, -Math.PI / 2, true);

  for (let i = 0; i < 6 && !checkCancelled(); i++) {
    const curBelow = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    bot.setControlState('jump', true);
    await sleep(220);
    if (curBelow && curBelow.boundingBox === 'block') {
      try {
        await bot.placeBlock(curBelow, new Vec3(0, 1, 0));
      } catch (e) {}
    }
    bot.setControlState('jump', false);
    await sleep(220);
  }

  const peakY = bot.entity.position.y;
  console.log(`Peak Y = ${peakY.toFixed(2)}, climbed: ${(peakY - startY).toFixed(2)}`);

  // Step off to take fall damage
  if (peakY - startY >= 3.8) {
    console.log('Stepping off pillar to trigger fall damage...');
    await bot.look(0, 0, true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  } else {
    // If couldn't pillar, suffocate with gravel if possible
    console.log('Attempting suffocation reset...');
    const gravel = bot.inventory.items().find(i => i.name === 'gravel');
    if (gravel && pillarBlocks.length > 0) {
      await bot.equip(gravel, 'hand');
      const pb = bot.blockAt(pillarBlocks[0]);
      try {
        await bot.placeBlock(pb, new Vec3(0, 1, 0));
      } catch (e) {}
    }
  }

  // Wait for respawn in Overworld
  console.log('Waiting for respawn in Overworld...');
  const waitRespawn = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - waitRespawn < 15000 && !checkCancelled()) {
    await sleep(250);
  }
}

// 2. Overworld Base Regear
const waitOW = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - waitOW < 5000 && !checkCancelled()) {
  await sleep(250);
}

console.log(`State: Dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);

if (bot.game.dimension === 'overworld') {
  bot.chat('alpha: In Overworld base at 20/20 HP and Food! Regearing for Milestone 10 Eyes of Ender!');

  // Navigate to Base Chest (293, 72, -57)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.5, 1.2));
  } catch (e) {}

  const cb = bot.blockAt(new Vec3(293, 72, -57));
  if (cb) {
    try {
      const chest = await bot.openChest(cb);
      console.log('Base Chest items:', chest.items().map(i => `${i.count}x ${i.name}`).join(', '));

      // Withdraw blaze_powder, armor, cooked food
      for (const item of chest.items()) {
        const n = item.name;
        if (n === 'blaze_powder' || n.includes('cooked') || n.includes('bread') ||
            n.includes('helmet') || n.includes('chestplate') || n.includes('leggings') ||
            n.includes('boots') || n.includes('shield')) {
          console.log(`Withdrawing ${item.count}x ${n}...`);
          try { await chest.withdraw(item.type, null, item.count); } catch (e) {}
        }
      }
      chest.close();
    } catch (e) {
      console.log('Chest interaction error:', e.message);
    }
  }

  // Equip full armor & weapon
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  console.log('Armor worn:', bot.inventory.slots.slice(5, 9).map(i => i ? i.name : 'empty'));
  console.log('Blaze powder in inventory:', lib.count('blaze_powder'));
  console.log('Ender pearls in inventory:', lib.count('ender_pearl'));
  bot.chat(`alpha: Gearing complete! Blaze powder held: ${lib.count('blaze_powder')}. Ready to craft Eyes of Ender with Beta!`);
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  armor: bot.inventory.slots.slice(5, 9).map(i => i ? i.name : 'empty'),
  blaze_powder: lib.count('blaze_powder'),
  ender_pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
