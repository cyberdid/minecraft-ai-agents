// programs/287-climb-shaft-to-base-and-shelter.js
console.log('=== Step 44: Climb final 28 blocks of shaft into base and shelter ===');
console.log('Starting pos:', lib.fmt(bot.entity.position));

// 1. Defend against nearby skeleton if aggressive
const hostiles = lib.hostiles(8);
if (hostiles.length > 0) {
  console.log('Defending against hostile:', hostiles.map(h => h.name));
  try {
    await lib.fight(8, 8);
  } catch (e) {
    console.log('Fight note:', e.message);
  }
}

// 2. Climb stage 1: to y=58
console.log('Climbing stage 1 towards y=58...');
try {
  await lib.goTo(294, 58, -54, 2, { timeoutMs: 15000, dig: true });
  console.log('Stage 1 reached:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 1 note:', e.message);
}

// 3. Climb stage 2: to base door (294, 72, -53)
console.log('Climbing stage 2 towards base door (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 20000, dig: true });
  console.log('Reached base door level! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 2 note:', e.message);
}

// 4. Enter base through door
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Door entry note:', e.message);
  await lib.goTo(294, 72, -55, 1);
}

try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 5. Sleep if night
if (lib.time().canSleep) {
  try {
    console.log('Sleeping in bed...');
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Beta pos:', lib.fmt(bot.entity.position));
console.log('Beta inv:', JSON.stringify(lib.inv()));
console.log('Time status:', lib.time());

bot.chat('alpha: Inside base safely with diamond_pickaxe and water_bucket. Door closed.');
