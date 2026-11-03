// programs/350-sleep-and-recover-gear.js
console.log('--- Step 1: Craft torches while inside base ---');
try {
  await lib.craft('torch', 8);
  console.log('Crafted torches! Torch count:', lib.count('torch'));
} catch (e) {
  console.log('Torch craft note:', e.message);
}

console.log('--- Step 2: Sleep through the night ---');
const bedBlock = bot.blockAt(new Vec3(294, 72, -55)) || bot.blockAt(new Vec3(293, 72, -55));
console.log('Bed block found:', bedBlock?.name);

let slept = false;
for (let wait = 0; wait < 45; wait++) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542) {
    console.log(`Time is ${t.timeOfDay}, attempting to sleep...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping via lib.sleepInBed()!');
      slept = true;
      await sleep(6000);
      break;
    } catch (e) {
      if (bedBlock) {
        try {
          await bot.activateBlock(bedBlock);
          console.log('Activated bed block!');
          slept = true;
          await sleep(6000);
          break;
        } catch (e2) {}
      }
    }
  }
  await sleep(1000);
}

// Wait for morning if still night
for (let wait = 0; wait < 30; wait++) {
  const t = lib.time();
  if (t.timeOfDay < 12000 || t.timeOfDay >= 23460) {
    console.log('Morning verified! Time:', t.timeOfDay);
    break;
  }
  await sleep(2000);
}

console.log('--- Step 3: Exit base at dawn and recover dropped gear at (268, 70, -65) ---');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -52.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Navigating towards dropped items at (268, 70, -65)...');
try {
  await lib.goTo(268, 70, -65, 3, { timeoutMs: 20000 });
  const picked = await lib.pickup(12);
  console.log('Picked up dropped items:', picked);
} catch (e) {
  console.log('Pickup at drop site error:', e.message);
}

// Equip armor if we picked up any!
try {
  await lib.equipArmor();
  console.log('Equipped best armor! Tools/Gear:', JSON.stringify(lib.tools()));
} catch (e) {
  console.log('Equip armor note:', e.message);
}

console.log('Final status:', JSON.stringify(lib.status()));
