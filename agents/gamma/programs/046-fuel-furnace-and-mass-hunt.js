// programs/046-fuel-furnace-and-mass-hunt.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Put fuel into furnace (295, 72, -57) so the 5 raw_iron smelts
const f2 = bot.blockAt(new Vec3(295, 72, -57));
if (f2) {
  try {
    const f = await bot.openFurnace(f2);
    if (!f.fuelItem() && lib.count('coal') > 0) {
      const coal = bot.inventory.items().find(i => i.name === 'coal');
      if (coal) {
        await f.putFuel(coal.type, null, 1);
        console.log('Fueled furnace with coal! Smelting started for 5 raw_iron.');
      }
    }
    f.close();
  } catch (e) {
    console.log('Fuel furnace error:', e.message);
  }
}

bot.chat('beta hold on! Gamma fueling furnace and hunting cows North to feed you!');

// 2. Exit base
try {
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
  await lib.walkTo(294.5, -52.5);
}

// 3. Hunt 3 cows/pigs/sheep North
console.log('Heading North towards cow pasture (305, 64, 26)...');
try {
  await lib.goTo(305, 64, 26, 3, { dig: true });
} catch (e) {}

let huntedCount = 0;
const huntTargets = ['cow', 'pig', 'sheep'];

for (let round = 0; round < 4; round++) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  const target = Object.values(bot.entities)
    .filter(e => e.name && huntTargets.includes(e.name) && e.position && e.position.distanceTo(bot.entity.position) < 40)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position))[0];

  if (!target) {
    console.log('Scanning wider North for cows/pigs/sheep...');
    const farther = Object.values(bot.entities)
      .filter(e => e.name && huntTargets.includes(e.name) && e.position && e.position.distanceTo(bot.entity.position) < 80)
      .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position))[0];
    if (farther) {
      console.log(`Approaching ${farther.name} at ${lib.fmt(farther.position)}...`);
      try { await lib.goTo(farther.position.x, farther.position.y, farther.position.z, 2, { dig: true }); } catch (e) {}
    }
    continue;
  }

  console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
  await lib.equipWeapon();
  try { await lib.goTo(target.position.x, target.position.y, target.position.z, 2, { dig: true }); } catch (e) {}
  
  const tid = target.id;
  const deadline = Date.now() + 8000;
  while (bot.entities[tid] && Date.now() < deadline && !isCancelled()) {
    await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));
    bot.attack(target);
    await sleep(550);
  }
  await sleep(300);
  await lib.pickup(6);
  huntedCount++;
}

console.log(`Hunted ${huntedCount} animals. Inventory:`, JSON.stringify(lib.inv()));

// 4. Return to base
console.log('Returning to base with food...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  console.log('Return error:', e.message);
}

console.log('Inside base at', lib.fmt(bot.entity.position));

// 5. Cook all raw meat in base furnaces
const rawMeats = ['beef', 'mutton', 'porkchop', 'chicken'];
for (const meatName of rawMeats) {
  const count = lib.count(meatName);
  if (count > 0) {
    const f1 = bot.blockAt(new Vec3(295, 72, -55));
    if (f1) {
      try {
        const f = await bot.openFurnace(f1);
        const item = bot.inventory.items().find(i => i.name === meatName);
        if (item) await f.putInput(item.type, null, item.count);
        if (!f.fuelItem() && lib.count('coal') > 0) {
          const coal = bot.inventory.items().find(i => i.name === 'coal');
          if (coal) await f.putFuel(coal.type, null, 1);
        }
        f.close();
      } catch (e) {}
    }
  }
}

// Check furnace 2 for smelted iron
if (f2) {
  try {
    const f = await bot.openFurnace(f2);
    if (f.outputItem()) {
      console.log(`Took ${f.outputItem().count} ${f.outputItem().name} from furnace 2!`);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {}
}

// Craft iron_helmet if 5 ingots
if (lib.count('iron_ingot') >= 5 && !lib.count('iron_helmet')) {
  await lib.ensureTable();
  console.log('Crafting iron_helmet...');
  try { await lib.craft('iron_helmet', 1); } catch (e) {}
}

await lib.equipArmor();

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Gear now:', JSON.stringify(lib.tools()));
bot.chat(`gamma back at base with meat cooking for Beta! Wearing: ${JSON.stringify(lib.tools())}`);
