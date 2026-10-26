// programs/259-prep-gear-and-mine-iron-vein.js
console.log('=== Step 17: Prep gear, torches, spare pickaxes, and mine iron vein ===');

// 1. Take cooked beef from F2
const f2Block = bot.blockAt(new Vec3(295, 72, -57));
if (f2Block) {
  const f2 = await bot.openFurnace(f2Block);
  if (f2.outputItem()) {
    console.log(`Took ${f2.outputItem().count} ${f2.outputItem().name} from F2.`);
    await f2.takeOutput();
  }
  f2.close();
}

// 2. Craft torches & spare pickaxes
if (lib.count('coal') > 0 && lib.count('stick') > 0 && lib.count('torch') < 8) {
  const crafts = Math.min(lib.count('coal'), Math.floor(lib.count('stick')));
  await lib.craft('torch', crafts * 4);
  console.log(`Crafted torches. Have: ${lib.count('torch')}`);
}

if (lib.count('stone_pickaxe') < 2 && lib.count('cobblestone') >= 6 && lib.count('stick') >= 4) {
  await lib.craft('stone_pickaxe', 2);
  console.log(`Crafted spare stone pickaxes. Have: ${lib.count('stone_pickaxe')}`);
}

await lib.equipArmor();
await lib.equipWeapon();

console.log('Gear ready:', {
  tools: lib.tools(),
  food: lib.count('cooked_*'),
  torches: lib.count('torch'),
  scaffold: lib.count('cobblestone') + lib.count('dirt')
});

// 3. Exit base door
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 4. Walk to shaft entrance at (302, 71, -44)
console.log('Walking to shaft entrance (302, 71, -44)...');
await lib.goTo(302, 71, -44, 1, { timeoutMs: 20000 });
console.log('At shaft entrance:', lib.fmt(bot.entity.position));

// 5. Check iron ores near (304, 52, -34)
const ironTargets = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 32,
  count: 15
});
console.log(`Found ${ironTargets.length} iron ores in range:`, ironTargets.map(p => lib.fmt(p)));

// 6. Mine reachable iron ores
const beforeIron = lib.count('raw_iron');
for (const p of ironTargets) {
  if (isCancelled() || lib.time().secondsUntilNight < 120) break;
  if (lib.count('raw_iron') - beforeIron >= 8) break;

  console.log(`Navigating towards iron ore at ${lib.fmt(p)}...`);
  try {
    // Navigate near the ore with dig enabled through dry ground
    await lib.goTo(p.x, p.y + 1, p.z, 2, { timeoutMs: 15000, dig: true });
    await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
    console.log(`Mined iron ore at ${lib.fmt(p)}! Raw iron now: ${lib.count('raw_iron')}`);
  } catch (e) {
    console.log(`Failed to mine at ${lib.fmt(p)}:`, e.message);
  }
}

// 7. Return to base before dusk
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -54, { timeoutMs: 30000 });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Return error:', e.message);
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Mining run done. Total raw_iron on beta: ${lib.count('raw_iron')}. Seconds until night: ${lib.time().secondsUntilNight}.`);
