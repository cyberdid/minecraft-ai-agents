// programs/390-bring-pickaxe-and-mine-gold.js
console.log('=== Program 390: Enter Nether, Share Pickaxe with Beta & Mine Gold ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Step through Nether portal (299.5, 73.0, -54.0)
console.log('Entering Nether portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299.5, 73.0, -54.0, 0, { timeoutMs: 15000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0));
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  await sleep(600);
  bot.setControlState('forward', false);
}

// 2. Wait for dimension change to the_nether
console.log('Waiting for Nether teleportation...');
for (let wait = 0; wait < 20; wait++) {
  if (bot.game.dimension === 'the_nether') break;
  await sleep(500);
}

console.log('Current dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('team: Alpha arrived in the Nether bunker with spare stone pickaxe for Beta!');

  // 3. Find Beta and toss spare stone_pickaxe
  const beta = bot.players['beta'];
  if (beta && beta.entity && lib.count('stone_pickaxe') > 1) {
    try {
      console.log(`Tossing stone_pickaxe to Beta at ${lib.fmt(beta.entity.position)}...`);
      await lib.goTo(beta.entity.position.x, beta.entity.position.y, beta.entity.position.z, 2, { timeoutMs: 10000 });
      await bot.toss(mcData.itemsByName.stone_pickaxe.id, null, 1);
      bot.chat('team: Tossed stone pickaxe to Beta! Mine the gold veins at (42, 57, -13) for golden boots!');
    } catch (e) {
      console.log('Toss note:', e.message);
    }
  }

  // 4. Mine nether_gold_ore veins near bunker at (42, 57, -13)
  const goldOres = bot.findBlocks({
    matching: mcData.blocksByName.nether_gold_ore?.id,
    maxDistance: 24,
    count: 8
  });
  console.log(`Found ${goldOres.length} gold ores nearby:`);

  let mined = 0;
  for (const gp of goldOres) {
    if (isCancelled()) break;
    try {
      console.log(`Mining gold ore at ${lib.fmt(gp)}...`);
      await lib.dig(gp.x, gp.y, gp.z);
      await sleep(300);
      await lib.pickup(4);
      mined++;
    } catch (err) {
      console.log('Gold dig note:', err.message);
    }
  }

  console.log(`Mined ${mined} gold ores. Gold nuggets in inv: ${lib.count('gold_nugget')}`);

  // 5. If we have 36+ nuggets (4 ingots), craft golden_boots!
  if (lib.count('gold_nugget') >= 36) {
    console.log('Crafting 4 gold_ingot and golden_boots...');
    try {
      await lib.craft('gold_ingot', 4);
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      console.log('Golden boots crafted and equipped! Piglins now 100% neutral!');
      bot.chat('team: Alpha equipped golden boots! Piglins are neutral. Ready to breach fortress!');
    } catch (e) {
      console.log('Boots craft note:', e.message);
    }
  }
}

bot.chat(`team: Alpha status: Dimension=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}/20, Gold nuggets=${lib.count('gold_nugget')}.`);

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
