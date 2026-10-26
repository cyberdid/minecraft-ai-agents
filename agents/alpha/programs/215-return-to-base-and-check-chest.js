// programs/215-return-to-base-and-check-chest.js
console.log('=== Program 215: Return to Base, Manage Chest & Craft Bed 2 ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

// 1. Walk to base entrance
console.log('Walking to base entrance (294, 72, -52)...');
try {
  await lib.goTo(294, 72, -52, 1, { timeoutMs: 30000 });
} catch (e) {
  console.log('Go to entrance warning:', e.message);
}

// 2. Enter base
console.log('Entering base...');
try {
  if (typeof passDoorIn === 'function') {
    await passDoorIn();
  } else {
    await lib.goThroughDoor(294, 72, -54);
  }
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door entry note:', e.message);
  await lib.goNearBlock(293, 72, -57);
}

// 3. Inspect chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
let chestItems = {};
try {
  chestItems = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chestItems));
} catch (e) {
  console.log('Read chest error:', e.message);
}

// 4. Check for wool in chest to craft Bed 2
const woolTypes = ['white_wool', 'black_wool', 'grey_wool', 'light_gray_wool', 'brown_wool', 'yellow_wool'];
let foundWool = null;
for (const w of woolTypes) {
  if (chestItems[w] >= 3 || lib.count(w) >= 3) {
    foundWool = w;
    break;
  }
}

if (foundWool && bot.blockAt(new Vec3(293, 72, -56))?.name === 'air') {
  console.log(`Found sufficient wool: ${foundWool}!`);
  if (lib.count(foundWool) < 3 && chestItems[foundWool] >= 3) {
    await lib.withdraw({ [foundWool]: 3 }, chestPos.x, chestPos.y, chestPos.z);
  }
  const bedColor = foundWool.replace('_wool', '_bed');
  console.log(`Crafting ${bedColor}...`);
  try {
    await lib.craft(bedColor, 1);
    console.log(`Placing ${bedColor} at (293, 72, -56)...`);
    await lib.place(bedColor, 293, 72, -56);
    console.log(`*** Bed 2 placed successfully! ***`);
    bot.chat(`beta: Bed 2 (${bedColor}) placed at (293, 72, -56)! Milestone 4 complete!`);
  } catch (err) {
    console.log('Craft/place bed error:', err.message);
  }
}

// 5. Deposit heavy building blocks into chest to lighten inventory
console.log('Depositing excess cobblestone and stones into chest...');
try {
  const depositObj = {};
  if (lib.count('cobblestone') > 64) depositObj.cobblestone = lib.count('cobblestone') - 64;
  if (lib.count('cobbled_deepslate') > 0) depositObj.cobbled_deepslate = 'all';
  if (lib.count('granite') > 0) depositObj.granite = 'all';
  if (lib.count('diorite') > 0) depositObj.diorite = 'all';
  if (lib.count('andesite') > 0) depositObj.andesite = 'all';
  if (lib.count('raw_copper') > 0) depositObj.raw_copper = 'all';
  
  if (Object.keys(depositObj).length > 0) {
    await lib.deposit(depositObj, chestPos.x, chestPos.y, chestPos.z);
    console.log('Deposited excess materials!');
  }
} catch (e) {
  console.log('Deposit error:', e.message);
}

// 6. Set spawn if Bed 2 placed or at Bed 1
try {
  await lib.setSpawn();
  console.log('Spawn set at bed!');
} catch (e) {
  console.log('Set spawn note:', e.message);
}

// 7. If night falls (canSleep is true), sleep!
if (lib.time().canSleep) {
  console.log('It is night, attempting sleep...');
  try {
    await lib.sleepInBed();
    bot.chat('beta: Sleeping in base bed to skip night!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: In base. Inventory ready with diamond_pickaxe and water_bucket. Night in ${lib.time().secondsUntilNight}s.`);
