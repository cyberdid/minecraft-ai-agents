// programs/384-rapid-craft-stone-gear.js
console.log('=== RAPID STONE GEAR & NETHER ENTRY ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Craft stone pickaxe
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
  console.log('Stone pickaxe crafted!');
}

// 2. Go to quarry floor at y=68
console.log('Navigating to quarry floor (304, 68, -52)...');
await lib.goTo(304, 68, -52, 2, { dig: true, timeoutMs: 12000 });

// 3. Mine 28 cobblestone
console.log('Mining 28 cobblestone...');
await lib.collect('stone', 28);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 4. Craft sticks and 2 stone swords
if (lib.count('stick') < 2 && lib.count('oak_planks') >= 2) {
  await lib.craft('stick', 4);
}
if (lib.count('cobblestone') >= 4 && lib.count('stick') >= 2) {
  console.log('Crafting 2 stone swords...');
  await lib.craft('stone_sword', 2);
  console.log('Stone swords crafted!');
}

// 5. Equip best sword
await lib.equipWeapon();

// 6. Check time before Nether transit
const t = lib.time();
console.log(`Time: ${t.timeOfDay}, night in: ${t.secondsUntilNight}s`);

// If night is approaching (< 90s), sleep in base first
if (t.secondsUntilNight < 90 || t.night) {
  console.log('Dusk approaching, entering base to sleep...');
  try {
    await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 8000 });
    await lib.goThroughDoor(294, 72, -54);
    if (t.canSleep) await lib.sleepInBed();
  } catch (e) {}
} else {
  // Step into Nether Portal!
  console.log('Daylight secure, entering Nether Portal at (298, 72, -54)...');
  try {
    await lib.goTo(298, 72, -53, 2, { dig: true, timeoutMs: 10000 });
    const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 5 });
    if (portals.length > 0) {
      const p = portals[0];
      bot.setControlState('jump', true);
      await lib.goTo(p.x + 0.5, p.y, p.z + 0.5, 0.5, { dig: false, timeoutMs: 8000 });
      bot.clearControlStates();
      console.log('Warping into Nether...');
      const t0 = Date.now();
      while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 16000)) {
        await sleep(500);
      }
    }
  } catch (e) {
    console.log('Portal entry note:', e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension);
console.log('Ending status:', JSON.stringify(lib.status()));
