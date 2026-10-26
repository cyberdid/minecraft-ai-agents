// programs/415-scout-morning-food-and-drops.js
console.log('=== Program 415: Scout Morning Drops, Animals & Restore Food ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check teammates in base
for (const name of ['beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name}: pos=${lib.fmt(p.entity.position)}`);
  }
}
bot.chat('team: Morning! Alpha is scanning base surroundings for morning mob drops and food.');

// 2. Scan for dropped items inside and immediately outside base
console.log('Checking for dropped items nearby...');
const drops = Object.values(bot.entities).filter(e => 
  e && (e.name === 'item' || e.type === 'object') && e.position &&
  bot.entity.position.distanceTo(e.position) < 24
);
console.log(`Found ${drops.length} dropped item entity(ies) within 24m.`);
for (const d of drops) {
  console.log(`- Drop at ${lib.fmt(d.position)} (dist: ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
}

// 3. Step outside door (294, 72, -54) to pick up morning drops (rotten flesh, bones, etc.)
try {
  await globalThis.passDoorOut();
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// Pickup drops within 16 blocks
console.log('Picking up drops around base entrance...');
try {
  await lib.pickup(16);
  console.log('Inventory after pickup:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Pickup note:', e.message);
}

// 4. Scan for animals within 50 blocks
const animals = Object.values(bot.entities).filter(e => 
  e && ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) && e.position &&
  bot.entity.position.distanceTo(e.position) < 50
);
console.log(`Animals visible outside: ${animals.length}`);
for (const a of animals.slice(0, 3)) {
  console.log(`Hunting ${a.name} at ${lib.fmt(a.position)}...`);
  try {
    await lib.equipWeapon();
    await lib.goTo(a.position.x, a.position.y, a.position.z, 2, { timeoutMs: 8000 });
    for (let hit = 0; hit < 4; hit++) {
      if (!bot.entities[a.id]) break;
      await bot.lookAt(a.position.offset(0, 0.5, 0), true);
      await bot.attack(a);
      await sleep(650);
    }
    await sleep(250);
    await lib.pickup(6);
  } catch (err) {
    console.log('Hunt err:', err.message);
  }
}

// 5. Return inside base
console.log('Returning inside base...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 15000 });
  await globalThis.passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Alpha at:', lib.fmt(bot.entity.position));
console.log('Inventory now:', JSON.stringify(lib.inv()));

// 6. Smelt any raw meat
const rawMeats = ['beef', 'mutton', 'porkchop', 'chicken'].filter(m => lib.count(m) > 0);
if (rawMeats.length > 0) {
  const fPos = new Vec3(295, 72, -55);
  const fBlock = bot.blockAt(fPos);
  if (fBlock) {
    for (const m of rawMeats) {
      const cnt = lib.count(m);
      console.log(`Cooking ${m}x${cnt}...`);
      try {
        const f = await bot.openFurnace(fBlock);
        const fuelItem = bot.inventory.items().find(i => i.name === 'coal');
        const meatItem = bot.inventory.items().find(i => i.name === m);
        if (fuelItem) await f.putFuel(fuelItem.type, null, 1);
        if (meatItem) await f.putInput(meatItem.type, null, cnt);
        for (let w = 0; w < cnt * 11; w++) {
          await sleep(1000);
          if (f.outputItem()) {
            console.log(`Cooked! Taking output...`);
            await f.takeOutput();
          }
          if (lib.count(m) === 0 && !f.inputItem()) break;
        }
        f.close();
      } catch (e) {}
    }
  }
}

// 7. Eat cooked food or rotten flesh if starving
const cookedFoods = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken'].filter(f => lib.count(f) > 0);
for (const cf of cookedFoods) {
  while (lib.count(cf) > 0 && bot.food < 20) {
    console.log(`Eating ${cf}...`);
    await globalThis.safeEat(cf);
    await sleep(200);
  }
}

if (bot.food < 8 && lib.count('rotten_flesh') > 0) {
  console.log('Low food! Eating rotten flesh to prevent starvation...');
  while (lib.count('rotten_flesh') > 0 && bot.food < 14) {
    await globalThis.safeEat('rotten_flesh');
    await sleep(200);
  }
}

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha status: Health=${bot.health}/20, Food=${bot.food}/20. Gear ready.`);
