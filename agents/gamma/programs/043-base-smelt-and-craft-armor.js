// programs/043-base-smelt-and-craft-armor.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Inspect and withdraw raw_iron & iron_ingots from chest
const chest = await lib.chestContents(293, 72, -57);
console.log('Chest contents:', JSON.stringify(chest));

if (chest.raw_iron) {
  console.log(`Withdrawing ${chest.raw_iron} raw_iron from chest...`);
  await lib.withdraw({ raw_iron: chest.raw_iron }, 293, 72, -57);
}
if (chest.iron_ingot) {
  console.log(`Withdrawing ${chest.iron_ingot} iron_ingot from chest...`);
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, 293, 72, -57);
}

// Deposit cobblestone surplus to free inventory slots
try {
  await lib.deposit({ cobblestone: 64, granite: 'all', diorite: 'all', rotten_flesh: 'all' }, 293, 72, -57);
} catch (e) {}

console.log(`Total raw_iron on hand: ${lib.count('raw_iron')}, coal: ${lib.count('coal')}`);

// 2. Setup parallel furnaces
// We know furnaces exist at (295, 72, -55) and (295, 72, -57)
const furnaces = [new Vec3(295, 72, -55), new Vec3(295, 72, -57)];

let remainingRaw = lib.count('raw_iron');
const perFurnace = Math.ceil(remainingRaw / furnaces.length);

for (const pos of furnaces) {
  const bl = bot.blockAt(pos);
  if (!bl || bl.name !== 'furnace') continue;
  try {
    const f = await bot.openFurnace(bl);
    // Take any output already there
    if (f.outputItem()) await f.takeOutput();
    
    // Put raw iron
    const toPut = Math.min(perFurnace, remainingRaw);
    if (toPut > 0) {
      const rawItem = bot.inventory.items().find(i => i.name === 'raw_iron');
      if (rawItem) {
        await f.putInput(rawItem.type, null, toPut);
        remainingRaw -= toPut;
      }
    }
    // Put coal fuel
    if (!f.fuelItem() && lib.count('coal') > 0) {
      const coalItem = bot.inventory.items().find(i => i.name === 'coal');
      if (coalItem) await f.putFuel(coalItem.type, null, 2);
    }
    f.close();
  } catch (e) {
    console.log(`Furnace at ${lib.fmt(pos)} error:`, e.message);
  }
}

bot.chat(`Smelting raw iron across base furnaces! Remaining before night: ${lib.time().secondsUntilNight}s`);

// 3. Monitor and collect smelted iron ingots
console.log('Smelting in progress... waiting for ingots');
const startTime = Date.now();
while (Date.now() - startTime < 80000 && !isCancelled() && lib.time().secondsUntilNight > 100) {
  await sleep(6000);
  for (const pos of furnaces) {
    const bl = bot.blockAt(pos);
    if (!bl || bl.name !== 'furnace') continue;
    try {
      const f = await bot.openFurnace(bl);
      if (f.outputItem()) {
        console.log(`Took ${f.outputItem().count} ${f.outputItem().name} from ${lib.fmt(pos)}`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }
  if (lib.count('iron_ingot') >= 24) break;
}

console.log(`Smelting complete! Total iron_ingots on hand: ${lib.count('iron_ingot')}`);

// 4. Craft Full Iron Armor
await lib.ensureTable();

if (lib.count('iron_ingot') >= 8 && !lib.count('iron_chestplate')) {
  console.log('Crafting iron_chestplate...');
  await lib.craft('iron_chestplate', 1);
}
if (lib.count('iron_ingot') >= 7 && !lib.count('iron_leggings')) {
  console.log('Crafting iron_leggings...');
  await lib.craft('iron_leggings', 1);
}
if (lib.count('iron_ingot') >= 5 && !lib.count('iron_helmet')) {
  console.log('Crafting iron_helmet...');
  await lib.craft('iron_helmet', 1);
}
if (lib.count('iron_ingot') >= 4 && !lib.count('iron_boots')) {
  console.log('Crafting iron_boots...');
  await lib.craft('iron_boots', 1);
}

// 5. Equip Full Iron Armor and Shield
await lib.equipArmor();

console.log('Armor equipped! Current inventory:', JSON.stringify(lib.inv()));
console.log('Night in:', lib.time().secondsUntilNight);
bot.chat(`gamma equipped: FULL IRON ARMOR & SHIELD! Milestone 3 achieved for gamma!`);
