// programs/597-craft-bucket-and-get-lava.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== GET LAVA BUCKET FOR PORTAL SILL ===');

// Step 1: Check furnace at (295, 72, -55) for iron ingots
const fPos = new Vec3(295, 72, -55);
const fb = bot.blockAt(fPos);
if (fb) {
  try {
    await lib.goTo(294, 72, -55, 1.2, { timeoutMs: 4000 });
    const fn = await bot.openFurnace(fb);
    const out = fn.outputItem();
    console.log('Furnace output:', out ? `${out.name} x${out.count}` : 'empty');
    if (out && out.name === 'iron_ingot') {
      await fn.takeOutput();
      console.log('Took iron ingots!');
    }
    await fn.close();
  } catch (e) {
    console.log('Furnace note:', e.message);
  }
}

console.log('Iron ingots in inv:', lib.count('iron_ingot'));

// Step 2: Craft bucket
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('lava_bucket') === 0) {
  console.log('Crafting empty bucket...');
  await lib.craft('bucket', 1);
  console.log('Bucket crafted! Total:', lib.count('bucket'));
}

// Check if we or Beta have empty bucket
if (lib.count('bucket') === 0 && lib.count('lava_bucket') === 0) {
  console.log('No bucket in inventory yet.');
  return { iron: lib.count('iron_ingot'), inv: lib.inv() };
}

bot.chat('gamma: I hold empty bucket! Sprinting to surface lava pool (333, 62, -78) to scoop lava!');

// Step 3: Run to surface lava pool at (333, 62, -78)
console.log('Running to surface lava pool at (333, 62, -78)...');
try {
  await lib.goTo(331, 63, -76, 2.0, { timeoutMs: 25000 });
} catch (e) {
  try {
    await lib.goToXZ(331, -76, { timeoutMs: 15000 });
  } catch (e2) {}
}

console.log('At lava pool area pos:', lib.fmt(bot.entity.position));

// Step 4: Scoop lava with lib.fillBucket('lava')
try {
  console.log('Scooping lava into bucket...');
  await lib.fillBucket('lava');
  console.log('SUCCESS: Lava bucket filled!');
  bot.chat('gamma: Lava bucket filled! Sprinting back to base to pour into portal sill (299, 72, -54)!');
} catch (e) {
  console.log('Fill lava note:', e.message);
}

// Step 5: Return to portal sill at (299, 72, -54)
console.log('Returning to portal at (299, 73, -53)...');
try {
  await lib.goTo(297, 73, -53, 1.5, { timeoutMs: 25000 });
} catch (e) {}

// Step 6: Pour lava into (299, 72, -54) if holding lava_bucket
if (lib.count('lava_bucket') > 0) {
  console.log('Placing lava into portal sill mold at (299, 72, -54)...');
  const moldBlock = bot.blockAt(new Vec3(299, 71, -54));
  if (moldBlock) {
    await bot.equip(mcData.itemsByName.lava_bucket.id, 'hand');
    await bot.lookAt(new Vec3(299.5, 71.9, -54.0), true);
    await bot.activateBlock(moldBlock, new Vec3(0, 1, 0));
    console.log('Lava poured into basin!');
    bot.chat('gamma: Lava placed in basin (299, 72, -54)! Beta/Alpha quench with water now!');
    await sleep(1500);
  }
}

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  inv: lib.inv(),
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name
};
