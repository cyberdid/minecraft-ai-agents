// programs/062-craft-tools-and-shield.js
console.log('--- Step 1: Craft initial stone tools ---');
console.log('Current inv:', JSON.stringify(lib.inv()));

// 1. Planks and sticks
if (lib.count('*_planks') < 4 && lib.count('oak_log') >= 1) {
  await lib.craft('oak_planks', 4);
}
if (lib.count('stick') < 6 && lib.count('*_planks') >= 2) {
  await lib.craft('stick', 4);
}

// 2. Craft stone tools
if (!lib.count('stone_pickaxe')) {
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
}
if (!lib.count('stone_axe')) {
  console.log('Crafting stone_axe...');
  await lib.craft('stone_axe', 1);
}
if (!lib.count('stone_sword')) {
  console.log('Crafting stone_sword...');
  await lib.craft('stone_sword', 1);
}

console.log('Tools after crafting:', JSON.stringify(lib.tools()));

// 3. Check furnace for iron ingots
const fBlock = bot.blockAt(new Vec3(295, 72, -55));
if (fBlock && (fBlock.name === 'furnace' || fBlock.name === 'lit_furnace')) {
  try {
    const f = await bot.openFurnace(fBlock);
    if (f.outputItem()) {
      console.log(`Taking ${f.outputItem().count} ${f.outputItem().name} from furnace`);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

// 4. Collect logs outside
console.log('Stepping outside to gather wood...');
await lib.goThroughDoor(294, 72, -54);
console.log('Outside door at:', lib.fmt(bot.entity.position));

console.log('Collecting 6 logs...');
const got = await lib.collect('*_log', 6);
console.log('Wood collected:', JSON.stringify(got));

// 5. Return inside base
console.log('Returning to base...');
await lib.goThroughDoor(294, 72, -54);
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 6. Craft planks & shield
await lib.craft('oak_planks', 12);
if (lib.count('iron_ingot') >= 1 && !lib.count('shield')) {
  console.log('Crafting shield...');
  await lib.craft('shield', 1);
  await lib.equipArmor();
}

console.log('Status: tools=', JSON.stringify(lib.tools()), 'inv=', JSON.stringify(lib.inv()));
bot.chat(`gamma geared up: tools=${JSON.stringify(lib.tools())}, shield=${lib.count('shield')}`);
