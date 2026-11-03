// programs/370-obtain-shield-and-cobble.js
console.log('=== OBTAIN SHIELD AND COBBLESTONE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Time:', lib.time().timeOfDay, 'Night in:', lib.time().secondsUntilNight);

// Step outside base door first so lib.obtain has free movement
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -52.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 1. Obtain shield
console.log('Obtaining shield via lib.obtain...');
try {
  const r = await lib.obtain('shield', 1);
  console.log('Shield obtained! Steps:', r.steps?.join('\n'));
} catch (e) {
  console.log('lib.obtain shield error:', e.message);
}

// 2. Ensure we have a stone sword
if (lib.count('stone_sword') === 0 && lib.count('iron_sword') === 0) {
  console.log('Obtaining stone_sword...');
  try {
    await lib.obtain('stone_sword', 1);
  } catch (e) {
    console.log('Sword obtain error:', e.message);
  }
}

// 3. Collect cobblestone up to 32
const cobbleNeeded = Math.max(0, 32 - lib.count('cobblestone'));
if (cobbleNeeded > 0) {
  console.log(`Mining ${cobbleNeeded} cobblestone...`);
  try {
    await lib.collect('stone', cobbleNeeded);
  } catch (e) {
    console.log('Cobblestone collect error:', e.message);
  }
}

// 4. Equip shield and weapon
try {
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Equipped gear! Tools/Gear:', JSON.stringify(lib.tools()));
} catch (e) {}

// 5. If night approaching, enter base
const t = lib.time();
if (t.secondsUntilNight < 90 || t.night) {
  console.log('Night approaching, entering base...');
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));
