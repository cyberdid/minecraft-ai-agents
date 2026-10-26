// programs/239-mine-diamonds-at-depth.js
console.log('=== Program 239: Mine Diamonds at y=-5 & Craft Diamond Pickaxe ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Exit base
console.log('Stepping outside base...');
try {
  if (typeof passDoorOut === 'function') await passDoorOut();
  else await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// 2. Travel to staircase entrance (345, 65, -40)
console.log('Heading to staircase entrance (345, 65, -40)...');
try {
  await lib.goTo(345, 65, -40, 2, { timeoutMs: 25000 });
} catch (e) {
  console.log('Stairs entrance note:', e.message);
}

// 3. Follow existing safe staircase down to y=0
const downStages = [
  { x: 335, y: 50, z: -48 },
  { x: 325, y: 31, z: -55 },
  { x: 313, y: 14, z: -58 },
  { x: 303, y: 0, z: -69 }
];

for (let i = 0; i < downStages.length; i++) {
  if (isCancelled()) break;
  const st = downStages[i];
  try {
    await lib.goTo(st.x, st.y, st.z, 2, { timeoutMs: 15000 });
    console.log(`Passed stage at y=${bot.entity.position.y.toFixed(0)}`);
  } catch (e) {}
}

console.log('At bottom of existing staircase! Pos:', lib.fmt(bot.entity.position));

// 4. Check for iron ore around (294, 0, -73)
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 16, count: 5 });
if (ironOres.length > 0 && lib.count('raw_iron') < 3) {
  console.log(`Mining ${ironOres.length} exposed iron ores at y=0...`);
  const stonePick = mcData.itemsByName.stone_pickaxe?.id;
  for (const ore of ironOres) {
    if (isCancelled() || lib.count('raw_iron') >= 3) break;
    try {
      await bot.equip(stonePick, 'hand');
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true, timeoutMs: 10000 });
      await bot.equip(stonePick, 'hand');
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await sleep(200);
      await lib.pickup(4);
    } catch (e) {}
  }
}

// 5. Navigate to diamond targets at y=-5
const diamondTargets = [
  new Vec3(288, -5, -74),
  new Vec3(288, -5, -75),
  new Vec3(288, -4, -75),
  new Vec3(287, -5, -74),
  new Vec3(287, -5, -75),
  new Vec3(300, -6, -64)
];

const ironPickId = mcData.itemsByName.iron_pickaxe.id;
await bot.equip(ironPickId, 'hand');

for (const pos of diamondTargets) {
  if (isCancelled() || lib.count('diamond') >= 3) break;
  const blk = bot.blockAt(pos);
  console.log(`Checking diamond at ${lib.fmt(pos)}: block=${blk?.name}`);
  if (!blk || !blk.name.includes('diamond_ore')) continue;

  console.log(`Moving near diamond at ${lib.fmt(pos)}...`);
  try {
    await lib.goTo(pos.x, pos.y, pos.z, 2, { dig: true, timeoutMs: 15000 });
  } catch (e) {}

  console.log(`Mining diamond at ${lib.fmt(pos)} with iron pickaxe...`);
  try {
    await bot.equip(ironPickId, 'hand');
    await lib.dig(pos.x, pos.y, pos.z);
    await sleep(200);
    await lib.pickup(6);
  } catch (e) {
    console.log('Dig diamond note:', e.message);
  }
  console.log(`Diamonds collected: ${lib.count('diamond')}`);
}

// If we need more diamonds, scan within 24m
if (lib.count('diamond') < 3) {
  const ores = lib.find(['diamond_ore', 'deepslate_diamond_ore'], { maxDistance: 24, count: 5 });
  console.log(`Scanning remaining ores: found ${ores.length}`);
  for (const ore of ores) {
    if (isCancelled() || lib.count('diamond') >= 3) break;
    try {
      await bot.equip(ironPickId, 'hand');
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true, timeoutMs: 15000 });
      await bot.equip(ironPickId, 'hand');
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await sleep(200);
      await lib.pickup(6);
    } catch (e) {}
  }
}

console.log(`Total diamonds in inventory: ${lib.count('diamond')}`);

// 6. Craft Diamond Pickaxe if we have >= 3 diamonds
if (lib.count('diamond') >= 3 && lib.count('diamond_pickaxe') === 0) {
  console.log('Crafting Diamond Pickaxe...');
  try {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('diamond_pickaxe', 1);
    console.log('*** Diamond Pickaxe Crafted! ***');
    bot.chat('beta: Diamond Pickaxe crafted! Milestone 6 re-secured! Ready for obsidian!');
  } catch (e) {
    console.log('Craft diamond pickaxe note:', e.message);
  }
}

bot.chat(`beta: Alpha at depth y=${bot.entity.position.y.toFixed(0)}. Diamonds: ${lib.count('diamond')}, Diamond Pickaxe: ${lib.count('diamond_pickaxe')}, Raw Iron: ${lib.count('raw_iron')}.`);
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Finished 239. Pos:', lib.fmt(bot.entity.position));
