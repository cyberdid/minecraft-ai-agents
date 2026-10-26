// programs/339-walk-to-base-and-eat-smelt.js
console.log('=== Program 339: Enter Base, Eat & Smelt Iron ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Walk into base
console.log('Walking to base door (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -54, 2, { timeoutMs: 35000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Walk to base note:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

// 2. Check chest for cooked food to eat
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest items:', JSON.stringify(contents));
  const foods = ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
  for (const f of foods) {
    if (contents[f] > 0) {
      console.log(`Withdrawing 3 ${f}...`);
      await lib.withdraw({ [f]: Math.min(3, contents[f]) }, chestPos.x, chestPos.y, chestPos.z);
      if (typeof safeEat === 'function') await safeEat(f);
      else await lib.eat();
      console.log(`Food after eating: ${bot.food}/20`);
      break;
    }
  }
} catch (e) {
  console.log('Chest food note:', e.message);
}

// 3. Smelt our 10 raw iron in the nearest base furnace
const raw = lib.count('raw_iron');
const coal = lib.count('coal');
console.log(`Smelting ${raw} raw_iron with ${coal} coal...`);
if (raw > 0 && coal > 0) {
  try {
    const res = await lib.smelt('raw_iron', 'coal', raw);
    console.log('Smelting result:', JSON.stringify(res));
  } catch (e) {
    console.log('Smelting note:', e.message);
  }
}

// 4. Craft leggings (7) or helmet (5) or boots (4)
const ingots = lib.count('iron_ingot');
console.log(`Available iron ingots: ${ingots}`);

if (ingots >= 7) {
  try { await lib.craft('iron_leggings', 1); console.log('Crafted iron_leggings!'); } catch (e) {}
}
if (lib.count('iron_ingot') >= 5) {
  try { await lib.craft('iron_helmet', 1); console.log('Crafted iron_helmet!'); } catch (e) {}
}
if (lib.count('iron_ingot') >= 4) {
  try { await lib.craft('iron_boots', 1); console.log('Crafted iron_boots!'); } catch (e) {}
}

await lib.equipArmor();
await lib.equipWeapon();

console.log('Alpha gear now:', JSON.stringify(lib.tools()));
console.log('Armor worn:', bot.inventory.items().filter(i => i.name.startsWith('iron_')).map(i => i.name));
bot.chat(`team: Alpha status: ${JSON.stringify(lib.tools())}, wearing: ${bot.inventory.items().filter(i => i.name.startsWith('iron_')).map(i => i.name).join(', ')}`);
