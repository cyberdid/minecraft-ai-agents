// programs/161-craft-shield-and-prep-portal-frame.js
console.log('--- Crafting Shield and Preparing Portal Site ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

// 1. Step outside base
const d = bot.blockAt(new Vec3(294, 72, -54));
if (d && !d.getProperties().open) await bot.activateBlock(d);
await lib.walkTo(294.5, -52.0, 3000);
if (d && d.getProperties().open) await bot.activateBlock(d);

// 2. Collect 1 log for planks
if (lib.count('*_planks') < 6) {
  console.log('Collecting 1 log...');
  try {
    await lib.collect('*_log', 1);
    const logItem = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
    if (logItem) {
      await lib.craft(logItem.replace('_log', '_planks'), 4);
    }
  } catch (e) {
    console.log('Log note:', e.message);
  }
}

// 3. Craft Shield
if (lib.count('*_planks') >= 6 && lib.count('iron_ingot') >= 1) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    await lib.equipArmor();
    console.log('Shield equipped in offhand!');
    bot.chat('alpha: Shield crafted and equipped in offhand!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

// 4. Portal shape and foundation
const portalBlocks = lib.shapes.portal(298, 72, -54, 'x');
console.log('Portal blocks definition:', JSON.stringify(portalBlocks));
console.log('Materials report:', JSON.stringify(lib.materials(portalBlocks)));

// Place the bottom cobblestone corners at (298, 72, -54) and (301, 72, -54)
if (lib.count('cobblestone') >= 2) {
  console.log('Placing bottom cobblestone corners of portal frame...');
  try {
    await lib.place('cobblestone', 298, 72, -54);
    await lib.place('cobblestone', 301, 72, -54);
    console.log('Bottom corners placed!');
  } catch (e) {
    console.log('Corner placement error:', e.message);
  }
}

// 5. Return inside base before nightfall
console.log('Returning inside base...');
await lib.goTo(294, 72, -53, 1);
const d2 = bot.blockAt(new Vec3(294, 72, -54));
if (d2 && !d2.getProperties().open) await bot.activateBlock(d2);
await lib.walkTo(293.5, -56.0, 3000);
if (d2 && d2.getProperties().open) await bot.activateBlock(d2);

console.log('Safely inside base. Pos:', lib.fmt(bot.entity.position));
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Inventory:', JSON.stringify(lib.inv()));
console.log('Night in:', lib.time().secondsUntilNight, 's');
