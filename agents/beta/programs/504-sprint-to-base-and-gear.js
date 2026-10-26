// programs/504-sprint-to-base-and-gear.js
console.log('=== Step: Return to Base & Gear up with Cobble ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'Night in:', bot.time.nightIn);

// 1. Sprint East to base (294, 72, -54)
const target = new Vec3(294, 72, -53);
console.log('Navigating East to base...');

try {
  await lib.goTo(240, 64, -70, 3.0);
} catch (e) {
  try { await lib.walkTo(240, -70); } catch (e2) {}
}

try {
  await lib.goTo(275, 68, -60, 3.0);
} catch (e) {
  try { await lib.walkTo(275, -60); } catch (e2) {}
}

try {
  await lib.goTo(target.x, target.y, target.z, 1.5);
  console.log('Reached base exterior at', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.walkTo(target.x, target.z); } catch (e2) {}
}

// 2. Step inside base (294, 72, -55)
try {
  await lib.door(294, 72, -54, true);
  await bot.lookAt(new Vec3(294.5, 72.5, -55.5), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
  await lib.door(294, 72, -54, false);
  console.log('Inside base at', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54, { close: true }); } catch (e2) {}
}

// 3. Set bed spawn
try { await lib.setSpawn(); } catch (e) {}

// 4. Check base chest at (293, 72, -57) for gear
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Base chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    for (const it of items) {
      if (it.name.endsWith('_pickaxe') || it.name.endsWith('_sword') || it.name === 'cobblestone' || it.name.endsWith('_planks') || it.name.endsWith('_log') || it.name.startsWith('cooked_') || it.name === 'shield') {
        await chest.withdraw(it.type, null, it.count);
        console.log(`Withdrew ${it.name}x${it.count}!`);
      }
    }
    chest.close();
  } catch (e) {}
}

try { await lib.equipArmor(); } catch (e) {}

console.log('Current inv:', JSON.stringify(lib.inv()), 'Gear:', JSON.stringify(lib.tools()));
bot.chat(`beta: At base re-arming station (${lib.fmt(bot.entity.position)}). Inv: ${JSON.stringify(lib.inv())}. Prepping safe Nether march!`);
