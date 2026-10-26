// programs/056-finish-iron-and-return-base.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Mine 2-3 more iron ores right nearby
const nearbyIron = bot.findBlocks({ matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore', maxDistance: 12, count: 5 });
console.log(`Found ${nearbyIron.length} iron ores within 12 blocks`);

for (const p of nearbyIron) {
  if (lib.count('raw_iron') >= 8 || isCancelled()) break;
  try {
    await lib.goTo(p.x, p.y, p.z, 2, { dig: true });
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
  } catch (e) {}
}

console.log(`Total raw_iron in inventory: ${lib.count('raw_iron')}`);
bot.chat(`gamma heading back to base with ${lib.count('raw_iron')} raw iron to smelt leggings & bucket!`);

// 2. Return to base in 2 stages
console.log('Stage 1: towards (350, 65, 10)...');
try {
  await lib.goTo(350, 65, 10, 3, { dig: true });
} catch (e) {
  console.log('Stage 1 error:', e.message);
}

console.log('Stage 2: towards base door (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  console.log('Stage 2 error:', e.message);
}

console.log('Inside base at', lib.fmt(bot.entity.position));

// 3. Put raw iron into base furnaces with coal
const furnaces = [new Vec3(295, 72, -55), new Vec3(295, 72, -57)];
let toSmelt = lib.count('raw_iron');

for (const pos of furnaces) {
  if (toSmelt <= 0) break;
  const bl = bot.blockAt(pos);
  if (!bl || bl.name !== 'furnace') continue;
  try {
    const f = await bot.openFurnace(bl);
    const countForThis = Math.min(toSmelt, 5);
    const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
    if (raw) {
      await f.putInput(raw.type, null, countForThis);
      toSmelt -= countForThis;
    }
    if (!f.fuelItem() && lib.count('coal') > 0) {
      const coal = bot.inventory.items().find(i => i.name === 'coal');
      if (coal) await f.putFuel(coal.type, null, 1);
    }
    f.close();
  } catch (e) {}
}

console.log('Waiting 30s for iron ingots to smelt...');
await sleep(30000);

// Collect ingots
for (const pos of furnaces) {
  const bl = bot.blockAt(pos);
  if (!bl || bl.name !== 'furnace') continue;
  try {
    const f = await bot.openFurnace(bl);
    if (f.outputItem()) {
      console.log(`Took ${f.outputItem().count} ${f.outputItem().name}`);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {}
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 4. Craft leggings if 7 ingots, or bucket if 3 ingots
await lib.ensureTable();
if (lib.count('iron_ingot') >= 7 && !lib.count('iron_leggings')) {
  console.log('Crafting iron_leggings...');
  await lib.craft('iron_leggings', 1);
  await lib.equipArmor();
  console.log('FULL IRON ARMOR EQUIPPED!');
}
if (lib.count('iron_ingot') >= 3 && !lib.count('bucket') && !lib.count('water_bucket')) {
  console.log('Crafting bucket...');
  await lib.craft('bucket', 1);
}

// 5. Fill water bucket if empty bucket
if (lib.count('bucket') > 0 && !lib.count('water_bucket')) {
  try {
    await lib.goThroughDoor(294, 72, -54, { close: false });
    await lib.fillBucket('water');
    await lib.goThroughDoor(294, 72, -54, { close: true });
  } catch (e) {}
}

await lib.equipArmor();

console.log('Final gamma gear:', JSON.stringify(lib.tools()));
console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma base update: gear=${JSON.stringify(lib.tools())}, water_bucket=${lib.count('water_bucket')}`);
