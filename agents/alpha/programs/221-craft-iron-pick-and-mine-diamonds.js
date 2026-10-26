// programs/221-craft-iron-pick-and-mine-diamonds.js
console.log('=== Program 221: Fast Iron Pickaxe & 3 Diamonds at y=-5 ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Step 1: Withdraw cobblestone from chest
const chestPos = new Vec3(293, 72, -57);
try {
  await lib.withdraw({ cobblestone: 16 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Withdrew 16 cobblestone');
} catch (e) {
  console.log('Withdraw note:', e.message);
}

// Step 2: Exit base and chop 3-4 logs from nearby tree
console.log('Exiting base to get wood...');
try {
  if (typeof passDoorOut === 'function') await passDoorOut();
  else await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

console.log('Collecting 4 logs...');
try {
  await lib.collect('*_log', 4);
} catch (e) {
  console.log('Collect log error:', e.message);
}

// Step 3: Craft planks, sticks, crafting table (if needed), stone pickaxe
const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logName) {
  await lib.craft(logName.replace('_log', '_planks'), lib.count(logName) * 4);
}
if (lib.count('*_planks') > 0 && lib.count('stick') < 6) {
  await lib.craft('stick', 8);
}
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  await lib.craft('stone_pickaxe', 1);
  console.log('Stone pickaxe crafted!');
}

// Step 4: Mine 4 iron ore from East hill (350, 55, -35)
console.log('Heading to East hill (350, 55, -35) for exposed iron ore...');
try {
  await lib.goTo(350, 55, -35, 2, { timeoutMs: 30000 });
} catch (e) {
  console.log('Go to hill note:', e.message);
}

// Scan for iron ore on the hill
let hillIron = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 24, count: 8 });
console.log(`Found ${hillIron.length} iron ore blocks on hill`);
if (hillIron.length > 0) {
  const stonePick = mcData.itemsByName.stone_pickaxe?.id;
  for (const ore of hillIron) {
    if (isCancelled() || lib.count('raw_iron') >= 3) break;
    try {
      await bot.equip(stonePick, 'hand');
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true, timeoutMs: 15000 });
      await bot.equip(stonePick, 'hand');
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await sleep(200);
      await lib.pickup(4);
    } catch (e) {
      console.log('Dig iron error:', e.message);
    }
  }
}

console.log(`Raw iron collected: ${lib.count('raw_iron')}`);

// Step 5: Return to base furnace to smelt iron
console.log('Returning to base to smelt iron...');
try {
  await lib.goTo(294, 72, -52, 2, { timeoutMs: 30000 });
  if (typeof passDoorIn === 'function') await passDoorIn();
  else await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

if (lib.count('raw_iron') >= 3) {
  console.log('Smelting 3 raw iron into ingots...');
  try {
    const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
    if (furnBlock) {
      const furn = await bot.openFurnace(furnBlock);
      // Put plank as fuel
      const plankItem = bot.inventory.items().find(i => i.name.endsWith('_planks'));
      if (plankItem) await furn.putFuel(plankItem.type, null, 2);
      await furn.putInput(mcData.itemsByName.raw_iron.id, null, 3);
      const deadline = Date.now() + 35000;
      while (lib.count('iron_ingot') < 3 && Date.now() < deadline) {
        if (isCancelled()) break;
        await sleep(1500);
        if (furn.outputItem()) await furn.takeOutput();
      }
      furn.close();
    }
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

console.log(`Iron ingots now: ${lib.count('iron_ingot')}`);

// Step 6: Craft iron pickaxe
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('iron_pickaxe', 1);
  console.log('Fresh iron_pickaxe crafted!');
}

// Step 7: Mine 3 diamonds at y=-5
if (lib.count('iron_pickaxe') >= 1) {
  console.log('Iron pickaxe ready! Stepping out to staircase at (345, 65, -40)...');
  try {
    if (typeof passDoorOut === 'function') await passDoorOut();
    await lib.goTo(345, 65, -40, 2, { timeoutMs: 30000 });
  } catch (e) {}

  // Descend down existing stairs to y=-5
  const stages = [
    { x: 335, y: 50, z: -48 },
    { x: 325, y: 31, z: -55 },
    { x: 313, y: 14, z: -58 },
    { x: 303, y: 0, z: -69 },
    { x: 295, y: -5, z: -70 }
  ];
  for (const st of stages) {
    if (isCancelled()) break;
    try { await lib.goTo(st.x, st.y, st.z, 2, { timeoutMs: 15000 }); } catch (e) {}
  }

  // Scan diamond ores at y=-5
  const diamondTargets = [
    new Vec3(288, -5, -74),
    new Vec3(288, -5, -75),
    new Vec3(288, -4, -75),
    new Vec3(287, -5, -74),
    new Vec3(300, -6, -64)
  ];
  const ironPickId = mcData.itemsByName.iron_pickaxe.id;

  for (const pos of diamondTargets) {
    if (isCancelled() || lib.count('diamond') >= 3) break;
    const blk = bot.blockAt(pos);
    if (!blk || !blk.name.includes('diamond_ore')) continue;
    console.log(`Mining diamond at ${lib.fmt(pos)}...`);
    try {
      await bot.equip(ironPickId, 'hand');
      await lib.goTo(pos.x, pos.y, pos.z, 2, { dig: true, timeoutMs: 15000 });
      await bot.equip(ironPickId, 'hand');
      await lib.dig(pos.x, pos.y, pos.z);
      await sleep(200);
      await lib.pickup(4);
    } catch (e) {
      console.log('Dig diamond error:', e.message);
    }
  }

  console.log(`Diamonds gathered: ${lib.count('diamond')}`);

  // Step 8: Craft Diamond Pickaxe
  if (lib.count('diamond') >= 3 && lib.count('diamond_pickaxe') === 0) {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('diamond_pickaxe', 1);
    console.log('*** Diamond Pickaxe Crafted! ***');
    bot.chat('beta: Diamond pickaxe crafted! Ready to head to (286, 18, 8) lava lake for 10 obsidian!');
  }
}

console.log('Finished 221. Inventory:', JSON.stringify(lib.inv()));
bot.chat(`beta: Alpha update: iron_pickaxe=${lib.count('iron_pickaxe')}, diamond=${lib.count('diamond')}, diamond_pickaxe=${lib.count('diamond_pickaxe')}. Pos: ${lib.fmt(bot.entity.position)}`);
