// programs/076-regear-morning.js
console.log('--- MORNING RE-GEARING ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Inspect chest at (293, 72, -57)
const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest:', JSON.stringify(chest));

// Withdraw building blocks & fuel
const toWithdraw = {};
if (chest.coal) toWithdraw.coal = Math.min(chest.coal, 2);
if (chest.granite) toWithdraw.granite = Math.min(chest.granite, 64);
if (chest.diorite) toWithdraw.diorite = Math.min(chest.diorite, 64);
if (chest.cobblestone) toWithdraw.cobblestone = Math.min(chest.cobblestone, 20);

if (Object.keys(toWithdraw).length > 0) {
  console.log('Withdrawing:', JSON.stringify(toWithdraw));
  await lib.withdraw(toWithdraw, 293, 72, -57);
}

// 2. Check furnaces
const fPos = [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -57)];
for (const p of fPos) {
  const b = bot.blockAt(p);
  if (b && (b.name === 'furnace' || b.name === 'lit_furnace')) {
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(p)}: in=${f.inputItem()?.name}x${f.inputItem()?.count}, out=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }
}

// 3. Step outside to gather logs
console.log('Exiting base door (294, 72, -54) to chop logs...');
await lib.goThroughDoor(294, 72, -54);
console.log('Outside at:', lib.fmt(bot.entity.position));

console.log('Collecting 6 logs...');
const got = await lib.collect('*_log', 6);
console.log('Collected:', JSON.stringify(got));

// 4. Return inside base
console.log('Returning inside base...');
await lib.goThroughDoor(294, 72, -54);
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 5. Craft planks, sticks, stone tools
const logType = Object.keys(got)[0] || 'oak_log';
const plankType = logType.replace('_log', '_planks');
await lib.craft(plankType, 16);
await lib.craft('stick', 8);

// If we withdrew granite/diorite/cobble, can we craft stone tools?
// In Minecraft recipes: stone tools require cobblestone or cobbled_deepslate or blackstone.
// Check cobblestone count:
if (lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
}
if (lib.count('cobblestone') >= 3) {
  await lib.craft('stone_axe', 1);
}
if (lib.count('cobblestone') >= 2) {
  await lib.craft('stone_sword', 1);
}

// Torches
if (lib.count('coal') > 0 && lib.count('stick') > 0) {
  await lib.craft('torch', 8);
}

// Check for iron to make shield
if (lib.count('iron_ingot') >= 1 && !lib.count('shield')) {
  await lib.craft('shield', 1);
  await lib.equipArmor();
}

console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma re-geared at base: tools=${JSON.stringify(lib.tools())}, inv=${JSON.stringify(lib.inv())}`);
