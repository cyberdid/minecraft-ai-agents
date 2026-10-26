// programs/149-sprint-to-base-set-spawn.js
console.log('--- SPRINT FROM WORLD SPAWN TO BASE ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Sprint directly towards base at (294, 72, -55)
console.log('Sprinting to base (294, 72, -55)...');
try {
  await lib.goToXZ(294, -55, { timeoutMs: 35000 });
} catch (e) {
  console.log('goToXZ note:', e.message);
}

console.log('Near base at:', lib.fmt(bot.entity.position));

// 2. Step inside base doorway to (294, 72, -55)
try {
  await lib.goTo(294, 72, -55, 1, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo doorway note:', e.message);
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Set spawn at the bed!
try {
  const result = await lib.setSpawn();
  console.log('lib.setSpawn result:', result);
} catch (e) {
  console.log('setSpawn err:', e.message);
  const bed = bot.findBlock({ matching: b => bot.isABed(b), maxDistance: 8 });
  if (bed) {
    console.log('Activating bed at', lib.fmt(bed.position));
    await bot.activateBlock(bed);
  }
}

// 4. If night arrives, sleep!
if (lib.time().canSleep) {
  console.log('Night is active, sleeping...');
  try {
    await lib.sleepInBed();
  } catch (e) {
    console.log('sleep err:', e.message);
  }
}

// 5. Check base chest at (293, 72, -57) for gear
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('Chest contains:', chest.containerItems().map(i => `${i.name}x${i.count}`).join(', '));
    for (const item of chest.containerItems()) {
      if (item.name.includes('cooked') || item.name.includes('bread') || item.name.includes('beef') ||
          item.name.includes('iron') || item.name.includes('shield') || item.name.includes('sword') ||
          item.name.includes('pickaxe') || item.name.includes('cobblestone') || item.name.includes('log')) {
        try { await chest.withdraw(item.type, null, item.count); } catch (err) {}
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest err:', e.message);
  }
}

console.log('Gamma inv now:', JSON.stringify(lib.inv()));
await lib.equipArmor();

bot.chat(`gamma sprinted back to base, spawn point set at bed! Ready to re-arm and return.`);
