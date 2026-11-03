// programs/796-respawn-and-warp.js
console.log('=== Program 796: Clean Respawn, Overworld Regear & Portal Warp ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. If bobbing in lava at y=31 with low HP, submerge to trigger instant clean respawn
if (bot.game.dimension === 'the_nether' && bot.entity.position.y < 35) {
  console.log('Submerging in lava to trigger clean respawn reset...');
  bot.chat('alpha: Respawning at Overworld Base to reset to 20/20 HP and re-enter portal with flint & steel!');
  
  const deathStart = Date.now();
  bot.setControlState('sneak', true);
  bot.setControlState('forward', true);
  
  while (bot.game.dimension === 'the_nether' && Date.now() - deathStart < 20000 && !checkCancelled()) {
    await sleep(250);
  }
  bot.clearControlStates();
}

// 2. Wait for respawn in Overworld
const respawnStart = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnStart < 15000 && !checkCancelled()) {
  await sleep(300);
}

console.log('Respawned! Dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 3. If in Overworld, sprint to Nether portal (299.5, 73.0, -54.0)
if (bot.game.dimension === 'overworld') {
  // If at base, check chest for cooked food
  if (bot.entity.position.distanceTo(new Vec3(293, 72, -57)) < 8.0) {
    try {
      const chestBlock = bot.findBlock({ matching: b => b && b.name.includes('chest'), maxDistance: 6 });
      if (chestBlock) {
        const chest = await bot.openChest(chestBlock);
        const food = chest.containerItems().find(i => i.name.includes('cooked') || i.name === 'bread');
        if (food) {
          console.log(`Taking ${food.name} x${Math.min(food.count, 16)} from base chest...`);
          await chest.withdraw(food.type, null, Math.min(food.count, 16));
        }
        chest.close();
      }
    } catch (e) {
      console.log('Base chest check notice:', e.message);
    }
  }

  // Overland waypoints to Nether portal (299.5, 73.0, -54.0)
  const overland = [
    new Vec3(200, 64, -70),
    new Vec3(240, 66, -65),
    new Vec3(280, 70, -60),
    new Vec3(299.5, 73.0, -54.0)
  ];

  for (const wp of overland) {
    if (checkCancelled()) break;
    if (bot.entity.position.distanceTo(wp) < 4.0) continue;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e) {
      try { await lib.goTo(wp.x, wp.y, wp.z, 3.0, { timeoutMs: 10000 }); } catch (e2) {}
    }
  }

  console.log('At Overworld Portal. Calling enterNetherPortal()...');
  bot.chat('alpha: Stepping into Overworld Nether portal to relight Nether frame and join Beta & Gamma!');
  
  await globalThis.enterNetherPortal(30000);

  if (bot.game.dimension !== 'the_nether') {
    const pb = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
    if (pb) {
      await bot.pathfinder.goto(new goals.GoalBlock(pb.position.x, pb.position.y, pb.position.z));
      bot.pathfinder.stop();
      bot.clearControlStates();
      const wait = Date.now();
      while (bot.game.dimension !== 'the_nether' && Date.now() - wait < 15000 && !checkCancelled()) {
        await sleep(250);
      }
    }
  }
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 4. In Nether: If portal frame is unlit, strike sill with flint & steel!
if (bot.game.dimension === 'the_nether') {
  console.log('In the Nether! Checking portal frame at (46, 66, 2)...');
  const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 12, count: 5 });
  console.log(`Active portal blocks found: ${portals.length}`);

  if (portals.length === 0) {
    console.log('Portal unlit! Equipping flint_and_steel to relight...');
    const fns = bot.inventory.items().find(i => i.name === 'flint_and_steel');
    if (fns) {
      await bot.equip(fns, 'hand');
      // Strike sill at (46, 66, 2)
      const sill = bot.blockAt(new Vec3(46, 65, 2)) || bot.blockAt(new Vec3(46, 66, 2));
      if (sill) {
        await bot.lookAt(new Vec3(46.5, 66.0, 2.5), true);
        await bot.activateBlock(sill, new Vec3(0, 1, 0));
        await sleep(500);
        bot.chat('alpha: Relit Nether portal at (46, 66, 2) with flint & steel!');
      }
    }
  }

  // Check nearby teammates
  const nearby = Object.values(bot.players).filter(p => p.username !== bot.username);
  for (const p of nearby) {
    if (p.entity) {
      console.log(`Teammate ${p.username} nearby at ${lib.fmt(p.entity.position)} (dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)})`);
    }
  }

  bot.chat(`alpha: Reunited with team at Nether Portal Camp ${lib.fmt(bot.entity.position)}! HP: ${bot.health}/20, Food: ${bot.food}/20.`);
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
