// programs/875-enter-the-end.js
console.log('=== Program 875: Enter The End & Reach Main Island ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: Ascending to End Portal at (2210, 0, 1470) and entering The End for Milestone 12 [Free the End]!');

// 1. If in overworld, ascend to portal at (2210, 0, 1470)
if (bot.game.dimension === 'overworld') {
  const portalTarget = new Vec3(2210, 0, 1470);
  console.log(`Ascending from ${lib.fmt(bot.entity.position)} to End Portal at ${lib.fmt(portalTarget)}...`);

  // Equip pickaxe to dig path up if obstructed
  const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
  if (pick) await bot.equip(pick, 'hand');

  // Pillar/ascend up to y=0
  const cobble = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'granite' || i.name === 'dirt');
  if (cobble) await bot.equip(cobble, 'hand');

  while (bot.entity.position.y < -0.5 && bot.game.dimension === 'overworld') {
    // Clear head
    const head1 = bot.blockAt(bot.entity.position.offset(0, 2, 0));
    const head2 = bot.blockAt(bot.entity.position.offset(0, 3, 0));
    if (head1 && head1.boundingBox === 'block' && head1.name !== 'end_portal' && head1.name !== 'end_portal_frame') {
      try { await bot.dig(head1, true); } catch (e) {}
    }
    if (head2 && head2.boundingBox === 'block' && head2.name !== 'end_portal' && head2.name !== 'end_portal_frame') {
      try { await bot.dig(head2, true); } catch (e) {}
    }

    const below = bot.blockAt(bot.entity.position.offset(0, -0.2, 0));
    bot.setControlState('jump', true);
    await sleep(220);
    if (below && below.boundingBox === 'block') {
      try { await bot.placeBlock(below, new Vec3(0, 1, 0)); } catch (e) {}
    }
    bot.setControlState('jump', false);
    await sleep(200);

    // Look towards portal XZ
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    await sleep(150);
    bot.setControlState('forward', false);
  }

  // Find end_portal block
  const portalBlock = bot.findBlock({
    matching: b => b && b.name === 'end_portal',
    maxDistance: 12
  });

  if (portalBlock) {
    console.log(`Stepping into active End Portal at ${lib.fmt(portalBlock.position)}...`);
    await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    
    const warpStart = Date.now();
    while (bot.game.dimension !== 'the_end' && Date.now() - warpStart < 15000) {
      await sleep(250);
    }
    bot.clearControlStates();
  }
}

console.log(`Current dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// 2. Once in the_end, inspect surroundings
if (bot.game.dimension === 'the_end') {
  bot.chat('alpha: ARRIVED IN THE END! Spawn platform at (100, 49, 0)! Commencing Milestone 12 Dragon Fight!');

  // Scan for Ender Dragon
  const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
  if (dragon) {
    console.log(`Ender Dragon detected! Pos: ${lib.fmt(dragon.position)}, Health: ${dragon.health || 'full'}`);
    bot.chat(`alpha: Ender Dragon spotted at ${lib.fmt(dragon.position)}!`);
  }

  // Scan for End Crystals
  const crystals = Object.values(bot.entities).filter(e => e.name === 'end_crystal');
  console.log(`Found ${crystals.length} End Crystals within render distance.`);
  for (const c of crystals) {
    console.log(`  Crystal at ${lib.fmt(c.position)}`);
  }

  // Equip weapons and armor
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Check path towards Main Island (0, 65, 0)
  const distToMain = bot.entity.position.distanceTo(new Vec3(0, 65, 0));
  console.log(`Distance to Main Island center: ${distToMain.toFixed(1)}m`);
}
