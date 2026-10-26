// programs/210-craft-iron-pick-and-mine-diamonds.js
console.log('=== Program 210: Craft Iron Pickaxe, Mine Diamonds & Craft Diamond Pickaxe ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Step 1: Craft Iron Pickaxe
if (lib.count('iron_pickaxe') === 0) {
  console.log('Crafting iron_pickaxe...');
  if (lib.count('stick') < 2) {
    await lib.craft('stick', 4);
  }
  await lib.craft('iron_pickaxe', 1);
  console.log('Iron pickaxe count:', lib.count('iron_pickaxe'));
}

const ironPick = mcData.itemsByName.iron_pickaxe?.id;
if (!ironPick || lib.count('iron_pickaxe') === 0) {
  throw new Error('Failed to obtain iron_pickaxe before mining diamonds!');
}

// Step 2: Equip iron pickaxe
await bot.equip(ironPick, 'hand');
console.log('Equipped iron_pickaxe');

// Step 3: Find and mine diamond ores
const targetDiamonds = [
  new Vec3(301, -5, -65),
  new Vec3(301, -6, -65),
  new Vec3(300, -5, -64),
  new Vec3(300, -6, -64),
  new Vec3(288, -5, -74),
  new Vec3(288, -5, -75),
  new Vec3(288, -4, -75),
  new Vec3(287, -5, -74),
  new Vec3(287, -5, -75)
];

for (const pos of targetDiamonds) {
  if (isCancelled()) break;
  if (lib.count('diamond') >= 3) {
    console.log('Already have 3+ diamonds!');
    break;
  }
  const blk = bot.blockAt(pos);
  console.log(`Checking diamond at ${lib.fmt(pos)}: block=${blk?.name}`);
  if (!blk || (!blk.name.includes('diamond_ore'))) {
    console.log(`Block at ${lib.fmt(pos)} is not diamond ore (${blk?.name}), skipping`);
    continue;
  }

  console.log(`Moving near ${lib.fmt(pos)}...`);
  try {
    await lib.goTo(pos.x, pos.y, pos.z, 2, { dig: true, timeoutMs: 20000 });
  } catch (e) {
    console.log(`goTo near ${lib.fmt(pos)} notice:`, e.message);
  }

  // Ensure iron pickaxe equipped
  await bot.equip(ironPick, 'hand');
  console.log(`Digging diamond ore at ${lib.fmt(pos)}...`);
  try {
    await lib.dig(pos.x, pos.y, pos.z);
    await sleep(300);
    await lib.pickup(6);
  } catch (e) {
    console.log(`Dig error at ${lib.fmt(pos)}:`, e.message);
  }
  console.log(`Current diamonds: ${lib.count('diamond')}`);
}

// Step 4: If not yet 3 diamonds, scan any remaining diamond_ore within 32 blocks
if (lib.count('diamond') < 3) {
  const ores = lib.find(['diamond_ore', 'deepslate_diamond_ore'], { maxDistance: 32, count: 10 });
  console.log(`Searching remaining ores: found ${ores.length}`);
  for (const ore of ores) {
    if (isCancelled() || lib.count('diamond') >= 3) break;
    try {
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true, timeoutMs: 20000 });
      await bot.equip(ironPick, 'hand');
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await sleep(300);
      await lib.pickup(6);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(ore.position)}:`, e.message);
    }
  }
}

console.log('Total diamonds gathered:', lib.count('diamond'));

// Step 5: Craft Diamond Pickaxe if we have >= 3 diamonds
if (lib.count('diamond') >= 3) {
  console.log('Crafting diamond_pickaxe...');
  if (lib.count('stick') < 2) {
    await lib.craft('stick', 4);
  }
  await lib.craft('diamond_pickaxe', 1);
  console.log('Diamond pickaxe count:', lib.count('diamond_pickaxe'));
  if (lib.count('diamond_pickaxe') >= 1) {
    bot.chat('beta: Milestone 6 reached: diamond_pickaxe crafted!');
  }
}

console.log('Inventory after 210:', JSON.stringify(lib.inv()));
