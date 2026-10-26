// programs/357-pool-ingots-and-craft-boots.js
console.log('=== Program 357: Pool Ingots in Chest & Craft Boots ===');

const chestPos = new Vec3(293, 72, -57);

// 1. Deposit Alpha's 2 iron ingots into chest to pool with team
if (lib.count('iron_ingot') > 0) {
  console.log(`Depositing ${lib.count('iron_ingot')} iron ingots into chest...`);
  try {
    await lib.deposit({ iron_ingot: lib.count('iron_ingot') }, chestPos.x, chestPos.y, chestPos.z);
  } catch (e) {
    console.log('Deposit note:', e.message);
  }
}

bot.chat('team: Alpha deposited 2 iron ingots in base chest! Beta & Delta, add yours now so we can craft iron_boots!');

// Wait 6 seconds for Beta & Delta to deposit their ingots
for (let i = 0; i < 3; i++) {
  if (isCancelled()) break;
  await sleep(2000);
}

// 2. Inspect chest and withdraw 4 iron ingots if available
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Pooled chest items:', JSON.stringify(contents));
  if (contents.iron_ingot >= 4) {
    console.log(`Withdrawing 4 iron ingots from chest...`);
    await lib.withdraw({ iron_ingot: 4 }, chestPos.x, chestPos.y, chestPos.z);
    
    console.log('Crafting iron_boots at table (295, 72, -56)...');
    await lib.craft('iron_boots', 1);
    await lib.equipArmor();
    console.log('CRAFTED AND EQUIPPED IRON BOOTS! Full iron armor complete!');
  }
} catch (e2) {
  console.log('Withdraw/craft note:', e2.message);
}

// 3. Check night and sleep protocol
for (let i = 0; i < 20; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep=true at ${t.timeOfDay}! Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping!');
    } catch (e) {}
    break;
  }
  await sleep(2000);
}

console.log('Alpha status:', JSON.stringify(lib.status()));
