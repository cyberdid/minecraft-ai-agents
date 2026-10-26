// programs/063-craft-sword-and-gather-wood.js
console.log('--- Step 1: Craft stick & stone sword ---');
await lib.craft('stick', 4);
await lib.craft('stone_sword', 1);

console.log('Tools now:', JSON.stringify(lib.tools()));

// Check furnace
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

console.log('--- Step 2: Step outside and gather wood ---');
await lib.goThroughDoor(294, 72, -54);
console.log('Outside door at:', lib.fmt(bot.entity.position));

const got = await lib.collect('*_log', 8);
console.log('Wood collected:', JSON.stringify(got));

console.log('--- Step 3: Return inside and craft shield ---');
await lib.goThroughDoor(294, 72, -54);
console.log('Inside base at:', lib.fmt(bot.entity.position));

// Craft planks from collected logs
const logType = Object.keys(got)[0] || 'oak_log';
const plankType = logType.replace('_log', '_planks');
await lib.craft(plankType, 16);

if (lib.count('iron_ingot') >= 1 && !lib.count('shield')) {
  console.log('Crafting shield...');
  await lib.craft('shield', 1);
  await lib.equipArmor();
}

console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma equipped: tools=${JSON.stringify(lib.tools())}, shield=${lib.count('shield')}, inv=${JSON.stringify(lib.inv())}`);
