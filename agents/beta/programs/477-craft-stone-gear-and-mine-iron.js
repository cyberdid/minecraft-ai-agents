// programs/477-craft-stone-gear-and-mine-iron.js
console.log('=== Step: Craft Stone Gear & Mine Iron ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Craft more sticks (2 planks -> 4 sticks)
if (lib.count('stick') < 4) {
  try {
    await lib.craft('stick', 1);
    console.log('Crafted sticks! Total:', lib.count('stick'));
  } catch (e) {
    console.log('Craft stick error:', e.message);
  }
}

// 2. Craft stone_pickaxe
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('SUCCESS: Crafted stone_pickaxe!');
  } catch (e) {
    console.log('Craft stone_pickaxe error:', e.message);
  }
}

// 3. Craft stone_sword
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('SUCCESS: Crafted stone_sword!');
  } catch (e) {
    console.log('Craft stone_sword error:', e.message);
  }
}

// 4. Craft stone_axe
if (lib.count('stone_axe') === 0 && lib.count('cobblestone') >= 3) {
  try {
    await lib.craft('stone_axe', 1);
    console.log('SUCCESS: Crafted stone_axe!');
  } catch (e) {
    console.log('Craft stone_axe error:', e.message);
  }
}

console.log('Gear now:', JSON.stringify(lib.tools()));
console.log('Inv now:', JSON.stringify(lib.inv()));

// 5. Scan for iron ore within 30 blocks
const ores = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 30,
  count: 8
});
console.log(`Found ${ores.length} iron ore blocks nearby`);

// Mine nearest iron ores
let mined = 0;
for (const op of ores) {
  if (isCancelled() || lib.count('raw_iron') >= 8) break;
  try {
    await lib.goTo(op.x, op.y, op.z, 2.5);
    await lib.dig(op.x, op.y, op.z);
    mined++;
    console.log(`Mined iron ore at ${lib.fmt(op)} (${mined})`);
  } catch (e) {
    console.log('Mine ore error:', e.message);
  }
}

// Pick up drops
await lib.pickup(6);

console.log('Raw iron count:', lib.count('raw_iron'));
bot.chat(`beta: Gear crafted! Tools: ${JSON.stringify(lib.tools())}, Raw iron: ${lib.count('raw_iron')}`);
