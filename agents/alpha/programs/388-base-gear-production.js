// programs/388-base-gear-production.js
console.log('=== Program 388: Base Gear Production & Full Armoring ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Enter base shelter (294, 72, -54)
console.log('Walking into base shelter...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 15000 });
  await globalThis.passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Inspect all furnaces at base
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fp of furnacePositions) {
  const b = bot.blockAt(fp);
  if (b && b.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(b);
      const out = f.outputItem();
      const inp = f.inputItem();
      const fuel = f.fuelItem();
      console.log(`Furnace at ${lib.fmt(fp)}: in=${inp?.count || 0} ${inp?.name || ''}, fuel=${fuel?.count || 0}, out=${out?.count || 0} ${out?.name || ''}`);
      if (out) {
        console.log(`Taking ${out.count} ${out.name} from furnace...`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {
      console.log(`Furnace ${lib.fmt(fp)} note:`, e.message);
    }
  }
}

// 3. Inspect base chest (293, 72, -57)
let chest = {};
try {
  chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest error:', e.message);
}

// 4. Check inventory
console.log('Alpha inventory after furnace check:', JSON.stringify(lib.inv()));

// 5. Check what armor and tools we can craft or withdraw
const toWithdraw = {};
if (chest['iron_ingot']) toWithdraw['iron_ingot'] = chest['iron_ingot'];
if (chest['gold_ingot']) toWithdraw['gold_ingot'] = chest['gold_ingot'];
if (chest['raw_iron']) toWithdraw['raw_iron'] = chest['raw_iron'];
if (chest['coal']) toWithdraw['coal'] = chest['coal'];
if (chest['cobblestone']) toWithdraw['cobblestone'] = Math.min(64, chest['cobblestone']);
if (chest['cooked_beef']) toWithdraw['cooked_beef'] = chest['cooked_beef'];
if (chest['bread']) toWithdraw['bread'] = chest['bread'];
if (chest['iron_sword']) toWithdraw['iron_sword'] = 1;
if (chest['iron_pickaxe']) toWithdraw['iron_pickaxe'] = 1;

if (Object.keys(toWithdraw).length > 0) {
  try {
    await lib.withdraw(toWithdraw, 293, 72, -57);
    console.log('Withdrawn items. New inv:', JSON.stringify(lib.inv()));
  } catch (e) {
    console.log('Withdraw note:', e.message);
  }
}

// 6. Smelt any raw iron or craft armor
if (lib.count('raw_iron') > 0 && lib.count('coal') > 0) {
  console.log('Smelting raw iron in base furnace...');
  try {
    await lib.smelt('raw_iron', 'coal', lib.count('raw_iron'));
  } catch (e) {}
}

// Craft sword & shield
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
    await lib.craft('birch_planks', 4);
  }
  if (lib.count('*_planks') >= 6) {
    try {
      await lib.craft('shield', 1);
      console.log('Shield crafted!');
    } catch (e) {}
  }
}

if (lib.count('*_sword') === 0 && lib.count('iron_ingot') >= 2) {
  try {
    await lib.craft('iron_sword', 1);
    console.log('Iron sword crafted!');
  } catch (e) {}
}

// Equip armor & shield
await lib.equipArmor();

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha at base re-arming station. Inv: ${JSON.stringify(lib.inv())}. Gear: ${JSON.stringify(lib.tools())}. HP: ${bot.health}/20.`);
