// programs/346-hunt-nearby-animals.js
console.log('=== Program 346: Scan Nearby Animals & Hunt ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Scan for nearby animals
const animals = Object.values(bot.entities).filter(e => 
  (e.name === 'cow' || e.name === 'sheep' || e.name === 'pig' || e.name === 'chicken') &&
  bot.entity.position.distanceTo(e.position) < 64
);
console.log(`Found ${animals.length} animals within 64m:`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)}, dist=${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

// 2. Exit base if inside
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// 3. If animals found, hunt the nearest 3
if (animals.length > 0) {
  console.log('Hunting nearest animals...');
  for (let i = 0; i < Math.min(3, animals.length); i++) {
    const a = animals[i];
    try {
      console.log(`Approaching ${a.name} at ${lib.fmt(a.position)}...`);
      await lib.goTo(a.position.x, a.position.y, a.position.z, 2, { timeoutMs: 15000 });
      await bot.equip(bot.inventory.items().find(it => it.name === 'iron_sword'), 'hand');
      await bot.attack(a);
      await sleep(600);
      await bot.attack(a);
      await sleep(500);
      await lib.pickup(4);
    } catch (e) {
      console.log(`Attack note:`, e.message);
    }
  }
} else {
  // Try lib.hunt towards South grassy river bank (317, 71, 40)
  console.log('Walking South towards grassy meadows (317, 71, 30)...');
  try {
    await lib.goTo(317, 71, 30, 3, { timeoutMs: 20000 });
    const got = await lib.hunt('cow', 2);
    console.log('Hunted:', JSON.stringify(got));
  } catch (e2) {
    console.log('South hunt note:', e2.message);
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));

// 4. Return to base to cook and eat
try {
  await lib.goTo(294, 72, -54, 2, { timeoutMs: 20000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Back in base!');
  
  for (const m of ['beef', 'mutton', 'porkchop', 'chicken']) {
    const count = lib.count(m);
    if (count > 0 && lib.count('coal') > 0) {
      console.log(`Cooking ${count} ${m}...`);
      await lib.smelt(m, 'coal', count);
    }
  }
  
  for (const c of ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken']) {
    if (lib.count(c) > 0) {
      console.log(`Eating ${c}...`);
      if (typeof safeEat === 'function') await safeEat(c);
      else await lib.eat();
      console.log(`Food now: ${bot.food}/20`);
      break;
    }
  }
} catch (e3) {
  console.log('Cooking note:', e3.message);
}

console.log('Alpha final status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha status: Health ${bot.health}/20, Food ${bot.food}/20. Gear: ${JSON.stringify(lib.tools())}`);
