// programs/736-enter-end-portal-to-the-end.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 736: ENTER ACTIVE END PORTAL TO THE END ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Configure pathfinder to go up to End Portal Room (2210, 1, 1470)
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

const portalCenter = new Vec3(2210.0, 1.0, 1470.0);

console.log('Ascending from y=-12 to End Portal at (2210, 1, 1470)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(portalCenter.x, portalCenter.y, portalCenter.z, 1.5));
} catch (e) {
  console.log('Pathfinder note:', e.message);
  // Manual pillaring if needed
  if (bot.entity.position.y < -1) {
    const cobble = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'netherrack');
    if (cobble) {
      await bot.equip(cobble, 'hand');
      console.log('Pillaring up toward y=0...');
      for (let s = 0; s < 14 && bot.entity.position.y < 0; s++) {
        const below = bot.blockAt(bot.entity.position.offset(0, -0.2, 0));
        bot.setControlState('jump', true);
        await sleep(220);
        if (below && below.boundingBox === 'block') {
          try { await bot.placeBlock(below, new Vec3(0, 1, 0)); } catch (pe) {}
        }
        bot.setControlState('jump', false);
        await sleep(200);
      }
    }
  }
}

// Now search for active end_portal blocks
console.log('Locating end_portal blocks at pos:', lib.fmt(bot.entity.position));
let portalBlocks = bot.findBlocks({
  matching: b => b && b.name === 'end_portal',
  maxDistance: 16,
  count: 9
});

console.log(`Found ${portalBlocks.length} active end_portal blocks!`);

if (portalBlocks.length === 0) {
  // If not near, move closer to (2210, 0, 1470)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(2210.0, 0.5, 1470.0, 1.0));
  } catch (e2) {}
  portalBlocks = bot.findBlocks({
    matching: b => b && b.name === 'end_portal',
    maxDistance: 8,
    count: 9
  });
}

if (portalBlocks.length > 0) {
  const p0 = portalBlocks[0];
  console.log(`Stepping directly into end_portal block at ${lib.fmt(p0)}...`);
  bot.chat('delta: Jumping into End Portal! Entering The End to fight the Ender Dragon!');
  
  await bot.lookAt(p0.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  
  const startWarp = Date.now();
  while (bot.game.dimension !== 'the_end' && Date.now() - startWarp < 15000 && !isCancelled()) {
    await sleep(250);
  }
  bot.clearControlStates();
}

console.log(`\n=== Current Dimension: ${bot.game.dimension} ===`);
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Scan for Ender Dragon & End Crystals if in the_end
if (bot.game.dimension === 'the_end') {
  const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
  if (dragon) {
    console.log(`ENDER DRAGON DETECTED at ${lib.fmt(dragon.position)}! HP: ${dragon.health}`);
    bot.chat(`delta: Sighted Ender Dragon in The End at ${lib.fmt(dragon.position)}!`);
  }
  const crystals = Object.values(bot.entities).filter(e => e.name === 'end_crystal');
  console.log(`End Crystals in range: ${crystals.length}`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
