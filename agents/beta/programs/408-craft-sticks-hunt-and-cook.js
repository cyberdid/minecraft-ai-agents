// programs/408-craft-sticks-hunt-and-cook.js
console.log('=== Step: Craft sticks, hunt nearby animals, cook and eat ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Craft planks & sticks
const bLog = bot.inventory.items().find(i => i.name === 'birch_log');
if (bLog) {
  const pr = bot.recipesFor(mcData.itemsByName.birch_planks.id, null, 1, null)[0];
  if (pr) await bot.craft(pr, 1, null);
}
const oLog = bot.inventory.items().find(i => i.name === 'oak_log');
if (oLog) {
  const pr = bot.recipesFor(mcData.itemsByName.oak_planks.id, null, 1, null)[0];
  if (pr) await bot.craft(pr, 1, null);
}

// Craft 8 sticks
const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
if (sr) {
  await bot.craft(sr, 2, null);
  console.log(`Crafted sticks! Total sticks: ${lib.count('stick')}`);
}

// 2. Scan for nearby animals
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 35
);
console.log(`Found ${animals.length} animals nearby.`);

for (const a of animals) {
  if (isCancelled() || lib.count('beef') + lib.count('mutton') + lib.count('porkchop') >= 3) break;
  try {
    console.log(`Hunting ${a.name} at ${lib.fmt(a.position)}...`);
    const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
    if (sword) await bot.equip(sword, 'hand');
    await lib.goTo(a.position.x, a.position.y, a.position.z, 2);
    await bot.attack(a);
    await sleep(400);
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
}

// Pick up drops
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
  } catch (e) {}
}

const rawMeat = lib.count('beef') + lib.count('mutton') + lib.count('porkchop') + lib.count('chicken');
console.log(`Raw meat gathered: ${rawMeat}`);

// 3. If we got raw meat, place furnace at feet and cook
const meatItem = bot.inventory.items().find(i => ['beef', 'mutton', 'porkchop', 'chicken'].includes(i.name));
if (meatItem && lib.count('furnace') > 0 && lib.count('coal') > 0) {
  console.log('Placing portable furnace to cook meat...');
  // Find solid ground next to bot
  const groundPos = bot.entity.position.offset(1, 0, 0).floored();
  try {
    await lib.place('furnace', groundPos.x, groundPos.y, groundPos.z);
    console.log('Placed furnace at', lib.fmt(groundPos));
    const fb = bot.blockAt(groundPos);
    if (fb) {
      const f = await bot.openFurnace(fb);
      await f.putFuel(mcData.itemsByName.coal.id, null, 1);
      await f.putInput(meatItem.type, null, Math.min(meatItem.count, 4));
      console.log(`Cooking ${meatItem.name}...`);
      f.close();
      
      // Wait 25 seconds for 2-3 cooked meat
      for (let w = 0; w < 5; w++) {
        await sleep(5000);
        if (isCancelled()) break;
        const fOpen = await bot.openFurnace(fb);
        const out = fOpen.outputItem();
        if (out && out.count >= 2) {
          await fOpen.takeOutput();
          console.log(`Harvested ${out.count} ${out.name}!`);
          fOpen.close();
          break;
        }
        fOpen.close();
      }
    }
    // Dig furnace back up
    await lib.dig(groundPos.x, groundPos.y, groundPos.z);
    console.log('Furnace recovered!');
  } catch (e) {
    console.log('Cooking note:', e.message);
  }
}

// 4. Eat cooked food
const edible = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken'];
for (const f of edible) {
  while (lib.count(f) > 0 && bot.food < 20 && !isCancelled()) {
    try {
      await bot.equip(mcData.itemsByName[f].id, 'hand');
      await bot.consume();
      console.log(`Ate ${f}. Food: ${bot.food}/20, Health: ${bot.health}/20`);
      await sleep(300);
    } catch (e) { break; }
  }
}

console.log(`Status after feast: Food=${bot.food}/20, Health=${bot.health}/20, Sticks=${lib.count('stick')}`);
bot.chat(`beta: Field meal complete! Food: ${bot.food}/20, Health: ${bot.health}/20. Moving to East hill iron quarry!`);
