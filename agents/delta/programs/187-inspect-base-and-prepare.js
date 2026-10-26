// programs/187-inspect-base-and-prepare.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// 1. Inspect all blocks in base
const counts = {};
for (let x = 291; x <= 296; x++) {
  for (let y = 71; y <= 75; y++) {
    for (let z = -59; z <= -53; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        counts[b.name] = (counts[b.name] || 0) + 1;
      }
    }
  }
}
console.log('Base blocks count:', JSON.stringify(counts));

// 2. Check chest items and withdraw leather if available
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name === 'chest') {
  const chest = await bot.openChest(chestBlock);
  const items = chest.containerItems();
  console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
  
  const leather = items.find(i => i.name === 'leather');
  if (leather && leather.count >= 4 && lib.count('leather_boots') === 0) {
    console.log('Withdrawing 4 leather for boots...');
    await chest.withdraw(leather.type, null, 4);
  }
  chest.close();
}

// 3. If we have leather, craft leather_boots
if (lib.count('leather') >= 4) {
  try {
    await lib.craft('leather_boots', 1);
    console.log('Crafted leather boots!');
    await lib.equipArmor();
    console.log('Equipped leather boots!');
  } catch (err) {
    console.log('Craft boots error:', err.message);
  }
}

// 4. Wait for night and sleep
console.log('Waiting for sleep time (tick >= 12542)...');
while (!isCancelled()) {
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep is true! Time: ${t.timeOfDay}. Attempting to sleep...`);
    try {
      await lib.sleepInBed();
      console.log('lib.sleepInBed completed successfully!');
    } catch (err) {
      console.log('sleepInBed error:', err.message);
    }
    break;
  }
  await sleep(1000);
}

console.log('Current status after sleep:', JSON.stringify(lib.time()));
console.log('Inventory:', JSON.stringify(lib.inv()));
