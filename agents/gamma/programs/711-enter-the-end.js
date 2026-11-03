// programs/711-enter-the-end.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 711: ENTER THE END & HOLD OBSIDIAN PLATFORM ===');
console.log('Current Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

if (bot.game.dimension !== 'the_end') {
  bot.chat('gamma: Stepping into End Portal (2215, -9, 1466) to enter The End!');

  const portalBlock = new Vec3(2215.5, -9.0, 1466.5);
  console.log(`Stepping to End Portal block at ${lib.fmt(portalBlock)}...`);

  // Move directly to portal block
  await bot.lookAt(portalBlock, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < -8.5) {
    bot.setControlState('jump', true);
  }

  const startEntry = Date.now();
  while (bot.game.dimension !== 'the_end' && Date.now() - startEntry < 12000 && !isCancelled()) {
    if (bot.entity.position.distanceTo(portalBlock) > 0.4) {
      await bot.lookAt(portalBlock, true);
      bot.setControlState('forward', true);
      if (bot.entity.position.y < -8.5 || bot.entity.isCollidedHorizontally) {
        bot.setControlState('jump', true);
        await sleep(150);
        bot.setControlState('jump', false);
      }
    }
    await sleep(100);
  }

  bot.clearControlStates();
}

console.log('Dimension after entry attempt:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_end') {
  bot.chat('gamma: SAFELY ARRIVED IN THE END! Holding center of Obsidian Platform!');
  console.log('=== IN THE END ===');
  console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

  // Stop all movement immediately to avoid falling into void
  bot.clearControlStates();
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  // Equip full armor, weapon, shield
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}

  // Survey The End
  const dragons = Object.values(bot.entities).filter(e => e && e.name === 'ender_dragon');
  console.log(`Ender Dragons found: ${dragons.length}`);
  for (const d of dragons) {
    console.log(`Dragon at ${lib.fmt(d.position)}, HP: ${d.health ?? 'unknown'}`);
  }

  const crystals = Object.values(bot.entities).filter(e => e && e.name === 'end_crystal');
  console.log(`End Crystals found: ${crystals.length}`);
  for (const c of crystals) {
    console.log(`Crystal at ${lib.fmt(c.position)}, dist=${bot.entity.position.distanceTo(c.position).toFixed(1)}m`);
  }

  // Find nearest end_stone blocks (main island)
  const endStone = bot.findBlocks({
    matching: b => b && b.name === 'end_stone',
    maxDistance: 64,
    count: 10
  });
  console.log(`Nearest End Stone blocks: ${endStone.length}`);
  if (endStone.length > 0) {
    console.log(`Closest end stone at ${lib.fmt(endStone[0])}, dist=${bot.entity.position.distanceTo(endStone[0]).toFixed(1)}m`);
  }

  // Check teammates in The End
  for (const [name, p] of Object.entries(bot.players)) {
    if (name === bot.username) continue;
    if (p.entity) {
      console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
    }
  }
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
