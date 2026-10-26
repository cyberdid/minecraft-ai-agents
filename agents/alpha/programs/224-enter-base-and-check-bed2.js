// programs/224-enter-base-and-check-bed2.js
console.log('=== Program 224: Enter Base, Close Door & Check Bed 2 ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time());

// 1. Enter base
console.log('Stepping through base door...');
try {
  await lib.door(294, 72, -54, true);
  await sleep(300);
  await lib.walkTo(294.5, -56);
  await lib.door(294, 72, -54, false);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door entry fallback...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {
    console.log('goThroughDoor note:', e2.message);
  }
}

// Ensure door is securely closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 2. Check chest items
const chestPos = new Vec3(293, 72, -57);
let chestItems = {};
try {
  chestItems = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest items:', JSON.stringify(chestItems));
} catch (e) {}

// Check for 3 wool of any single color
const colors = ['white', 'gray', 'light_gray', 'black', 'brown'];
let readyColor = null;
for (const c of colors) {
  const w = `${c}_wool`;
  if ((chestItems[w] || 0) + (lib.count(w) || 0) >= 3) {
    readyColor = c;
    break;
  }
}

if (readyColor && bot.blockAt(new Vec3(293, 72, -56))?.name === 'air') {
  console.log(`Crafting ${readyColor}_bed...`);
  try {
    const w = `${readyColor}_wool`;
    if (lib.count(w) < 3) {
      await lib.withdraw({ [w]: 3 - lib.count(w) }, chestPos.x, chestPos.y, chestPos.z);
    }
    await lib.craft(`${readyColor}_bed`, 1);
    await lib.place(`${readyColor}_bed`, 293, 72, -56);
    console.log('Bed 2 placed!');
    bot.chat('beta: Bed 2 placed! Milestone 4 complete! Let us both sleep in bed to skip night!');
  } catch (err) {
    console.log('Bed craft error:', err.message);
  }
} else {
  bot.chat('beta: Welcome back! Do you hold any wool? Chest has 2 gray and 2 light_gray wool. If you have 1 wool toss it, otherwise let us wait out the night inside!');
}

// 3. Craft stone tools for Alpha if missing
try {
  if (lib.count('stick') < 4 && lib.count('birch_planks') >= 2) {
    await lib.craft('stick', 4);
  }
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted!');
  }
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  }
} catch (e) {
  console.log('Craft tools note:', e.message);
}

// 4. Try sleep if canSleep
if (lib.time().canSleep) {
  console.log('Attempting sleepInBed...');
  await lib.sleepInBed().catch(e => console.log('Sleep note:', e.message));
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Status:', JSON.stringify(lib.status()));
