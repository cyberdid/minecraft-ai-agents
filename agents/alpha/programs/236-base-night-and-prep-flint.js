// programs/236-base-night-and-prep-flint.js
console.log('=== Program 236: Base Night Protocol & Prep Flint ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time());

// 1. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 2. Chat with Beta to align on plan
bot.chat('beta: Both back at base! Fresh plan: spend night in base, at dawn mine 10 iron at (350, 55, -35), craft bucket & pickaxe, get 3 diamonds at safe y=-5, then quench lava safely from ledge!');

// 3. Withdraw gravel and cobblestone from chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest items:', JSON.stringify(contents));
  if (contents.gravel > 0) {
    await lib.withdraw({ gravel: contents.gravel }, chestPos.x, chestPos.y, chestPos.z);
  }
  if (contents.cobblestone > 0 && lib.count('cobblestone') < 32) {
    await lib.withdraw({ cobblestone: Math.min(contents.cobblestone, 32) }, chestPos.x, chestPos.y, chestPos.z);
  }
  if (contents.cooked_mutton > 0) {
    await lib.withdraw({ cooked_mutton: contents.cooked_mutton }, chestPos.x, chestPos.y, chestPos.z);
  }
} catch (e) {
  console.log('Withdraw note:', e.message);
}

// 4. Get flint from gravel if missing
if (lib.count('flint') === 0 && lib.count('gravel') > 0) {
  console.log('Placing and digging gravel for flint...');
  const digSpot = new Vec3(294, 72, -56);
  for (let attempt = 0; attempt < 25 && lib.count('flint') === 0 && lib.count('gravel') > 0; attempt++) {
    if (isCancelled()) break;
    try {
      const blk = bot.blockAt(digSpot);
      if (blk && blk.name === 'air') {
        await lib.place('gravel', digSpot.x, digSpot.y, digSpot.z);
      }
      await lib.dig(digSpot.x, digSpot.y, digSpot.z);
      await sleep(200);
      await lib.pickup(4);
    } catch (e) {}
  }
}

console.log(`Flint obtained: ${lib.count('flint')}, Gravel remaining: ${lib.count('gravel')}`);

// 5. Try sleeping if night allows
if (lib.time().canSleep) {
  console.log('Attempting sleep in Bed 1...');
  await lib.sleepInBed().catch(e => console.log('Sleep note:', e.message));
}

console.log('Alpha inventory now:', JSON.stringify(lib.inv()));
console.log('Status:', JSON.stringify(lib.status()));
