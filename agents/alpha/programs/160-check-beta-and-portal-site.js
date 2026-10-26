// programs/160-check-beta-and-portal-site.js
console.log('--- Checking Beta, Base Chest, and Portal Site ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check Beta
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p && p.entity) {
    console.log(`Beta is at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}

// 2. Check base chest
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest check error:', e.message);
}

// 3. Check portal site at (298, 72, -54)
console.log('Checking portal site foundation blocks (298..301, 71..72, -54)...');
for (let x = 298; x <= 301; x++) {
  const floor = bot.blockAt(new Vec3(x, 71, -54));
  const b1 = bot.blockAt(new Vec3(x, 72, -54));
  console.log(`  x=${x}: floor(y=71)=${floor?.name}, y=72=${b1?.name}`);
}

// 4. If we have 1 iron and can get 2 more planks, craft shield!
if (lib.count('iron_ingot') >= 1 && lib.count('shield') === 0) {
  if (lib.count('*_planks') < 6) {
    // try to collect 1 log or craft from log
    const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
    if (log) {
      await lib.craft(log.replace('_log', '_planks'), 4);
    }
  }
  if (lib.count('*_planks') >= 6) {
    console.log('Crafting shield...');
    try {
      await lib.craft('shield', 1);
      await lib.equipArmor();
      console.log('Shield crafted and equipped!');
    } catch (e) {
      console.log('Shield error:', e.message);
    }
  }
}

bot.chat('alpha: Checking portal site at (298, 72, -54). Ready to build portal frame.');
console.log('Night in:', lib.time().secondsUntilNight, 's');
