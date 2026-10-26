// programs/054-morning-gear-and-water.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Inspect furnaces
const furnaces = [new Vec3(295, 72, -55), new Vec3(295, 72, -57)];
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

// 2. Check chest
const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest:', JSON.stringify(chest));

if (chest.iron_ingot) {
  console.log(`Withdrawing ${chest.iron_ingot} iron_ingots from chest...`);
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, 293, 72, -57);
}

// Deposit surplus coal for teammates to use
if (lib.count('coal') > 4) {
  try {
    await lib.deposit({ coal: 4 }, 293, 72, -57);
    console.log('Deposited 4 coal in base chest for team');
  } catch (e) {}
}

console.log('Iron ingots in gamma inv:', lib.count('iron_ingot'));

// 3. Craft iron_leggings if 7 ingots, or bucket if 3 ingots
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

// 4. If we have empty bucket, fill with water
if (lib.count('bucket') > 0 && !lib.count('water_bucket')) {
  console.log('Filling water bucket outside base...');
  try {
    await lib.goThroughDoor(294, 72, -54, { close: false });
    const res = await lib.fillBucket('water');
    console.log('Bucket result:', res);
    await lib.goThroughDoor(294, 72, -54, { close: true });
  } catch (e) {
    console.log('Water bucket error:', e.message);
  }
}

await lib.equipArmor();

console.log('Gamma gear now:', JSON.stringify(lib.tools()));
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`gamma morning update: gear=${JSON.stringify(lib.tools())}, water_bucket=${lib.count('water_bucket')}, leggings=${lib.count('iron_leggings')}`);
