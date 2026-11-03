// programs/768-collect-cobble-and-fortify-nether-portal.js
console.log('=== Program 768: Collect Cobble, Fortify Portal & Mine Gold ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Collect 32 cobblestone in Overworld
if (bot.game.dimension === 'overworld') {
  console.log('Collecting stone for cobblestone...');
  try {
    await lib.collect('stone', 32);
    console.log('Cobblestone collected! Total:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Collect stone note:', e.message);
  }

  // Step 2: Craft 2 stone pickaxes
  if (lib.count('stone_pickaxe') < 2 && lib.count('cobblestone') >= 6) {
    if (lib.count('stick') < 4) {
      try { await lib.craft('stick', 4); } catch (e) {}
    }
    try {
      await lib.craft('stone_pickaxe', 2);
      console.log('Crafted stone pickaxes! Total:', lib.count('stone_pickaxe'));
    } catch (e) {
      console.log('Craft pickaxes note:', e.message);
    }
  }

  // Equip armor & weapon
  if (bot.inventory.slots[8]?.name !== 'golden_boots') {
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
  }
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Step 3: Enter Nether Portal at (299.5, 73, -54)
  console.log('Entering Nether Portal...');
  const warpRes = await enterNetherPortal();
  console.log('Nether portal warp result:', warpRes);
}

// Step 4: In the_nether, raise shield immediately and fortify portal
if (bot.game.dimension === 'the_nether') {
  console.log('In the_nether! Raising offhand shield against Ghasts...');
  bot.activateItem(true); // Raise shield immediately!

  bot.chat('Beta: In Nether! Full 20 HP, 20 Food, golden_boots active! Fortifying portal against Ghasts!');

  // Place cobblestone blast wall around portal opening if cobble available
  if (lib.count('cobblestone') >= 6) {
    const wallSpots = [
      new Vec3(44, 66, 1),
      new Vec3(44, 67, 1),
      new Vec3(44, 66, 2),
      new Vec3(44, 67, 2),
      new Vec3(44, 66, 3),
      new Vec3(44, 67, 3)
    ];

    for (const p of wallSpots) {
      const cur = bot.blockAt(p);
      if (cur && cur.name === 'air') {
        try {
          await lib.place('cobblestone', p.x, p.y, p.z);
          console.log(`Placed blast wall block at ${lib.fmt(p)}`);
        } catch (e) {
          console.log(`Place wall note at ${lib.fmt(p)}:`, e.message);
        }
      }
    }
  }

  // Step 5: Scan and mine nether_gold_ore within 32m
  configureFireAvoidance();
  const ores = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 32,
    count: 15
  });
  console.log(`Found ${ores.length} nether_gold_ore blocks within 32m:`, ores.map(p => lib.fmt(p)).join(', '));

  let mined = 0;
  for (const op of ores) {
    if (isCancelled()) break;
    if (op.y < 62) continue; // Skip dangerous low ores near lava lake

    console.log(`Approaching nether_gold_ore at ${lib.fmt(op)}...`);
    if (typeof globalThis.clearFireAhead === 'function') await globalThis.clearFireAhead();

    try {
      await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2.2));
      const b = bot.blockAt(op);
      if (b && b.name === 'nether_gold_ore') {
        const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
        if (pick) await bot.equip(pick, 'hand');
        await bot.dig(b);
        mined++;
        await sleep(200);
        await lib.pickup(3.5);
      }
    } catch (e) {
      console.log(`Mining note at ${lib.fmt(op)}:`, e.message);
    }
  }

  await lib.pickup(4.0);
  const totalNuggets = lib.count('gold_nugget');
  console.log(`Mined ${mined} ores. Total nuggets on Beta: ${totalNuggets}`);
  bot.chat(`Beta: Mining round done! Mined ${mined} gold ores. Holding ${totalNuggets} nuggets (${Math.floor(totalNuggets/9)} ingots)!`);

  // Craft ingots if table is nearby
  const table = bot.findBlock({ matching: b => b && b.name.includes('crafting_table'), maxDistance: 16 });
  if (table && totalNuggets >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(totalNuggets / 9));
      console.log(`Crafted ingots! Total: ${lib.count('gold_ingot')}`);
      bot.chat(`Beta: Crafted ${lib.count('gold_ingot')} Gold Ingots for Piglin bartering!`);
    } catch (e) {}
  }
}

console.log('=== Program 768 Final Status ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Feet:', bot.inventory.slots[8]?.name);
console.log('Ingots:', lib.count('gold_ingot'), 'Nuggets:', lib.count('gold_nugget'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget'),
  cobblestone: lib.count('cobblestone')
};
