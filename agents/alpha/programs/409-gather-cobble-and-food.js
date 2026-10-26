// programs/409-gather-cobble-and-food.js
console.log('=== Program 409: Mine Local Cobble, Craft Stone Tools & Hunt Food ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Time until night:', lib.time().secondsUntilNight);

// 1. Ask team in chat
bot.chat('team: Alpha at base crafting stone tools & gathering meat before entering Nether portal to join Delta.');

// 2. Check crafting table
const ctPos = new Vec3(295, 72, -56);
console.log('Crafting table block:', bot.blockAt(ctPos)?.name);

// 3. Find stone blocks within 12 blocks (e.g. at mine shaft 302, 71, -44 or nearby)
let stoneTarget = bot.findBlocks({
  matching: b => ['stone', 'cobblestone', 'deepslate'].includes(b.name),
  maxDistance: 12,
  count: 10
});

console.log(`Local stone blocks within 12m: ${stoneTarget.length}`);

// If no exposed stone within 12m, dig down 2 dirt blocks at (296, 72, -53) to expose stone
if (stoneTarget.length < 3) {
  console.log('Exposing stone near entrance...');
  try {
    await lib.dig(296, 71, -53);
  } catch (e) {}
  stoneTarget = bot.findBlocks({
    matching: b => ['stone', 'cobblestone', 'deepslate'].includes(b.name),
    maxDistance: 12,
    count: 10
  });
}

// 4. Mine 3 stone with wooden pickaxe to craft stone pickaxe
if (lib.count('cobblestone') < 3 && lib.count('stone_pickaxe') === 0) {
  console.log('Mining 3 stone for stone_pickaxe...');
  for (const pos of stoneTarget.slice(0, 3)) {
    try {
      await lib.dig(pos.x, pos.y, pos.z);
    } catch (e) {
      console.log('Dig stone error:', e.message);
    }
  }
}

// 5. Craft stone pickaxe
try {
  if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe! Inv:', JSON.stringify(lib.inv()));
  }
} catch (e) {
  console.log('Craft pickaxe error:', e.message);
}

// 6. Mine 16 cobblestone with stone pickaxe (within 16m only, do NOT wander!)
if (lib.count('cobblestone') < 16) {
  console.log('Mining cobblestone up to 16...');
  const moreStone = bot.findBlocks({
    matching: b => ['stone', 'deepslate'].includes(b.name),
    maxDistance: 16,
    count: 20
  });
  for (const pos of moreStone) {
    if (lib.count('cobblestone') >= 16 || isCancelled()) break;
    // Don't break protected base blocks
    if (pos.y >= 71 && pos.x >= 292 && pos.x <= 296 && pos.z >= -58 && pos.z <= -54) continue;
    try {
      await lib.dig(pos.x, pos.y, pos.z);
    } catch (e) {}
  }
  await lib.pickup(6);
  console.log('Cobblestone count now:', lib.count('cobblestone'));
}

// 7. Craft stone sword if needed
try {
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    await lib.craft('stone_sword', 1);
  }
} catch (e) {}

// 8. Equip best weapon
await lib.equipWeapon();

// 9. Check food: if meat needed, scan outside for animals
console.log('Checking food situation. Current food:', bot.food, 'Meat count in inv:', lib.count('*beef') + lib.count('*mutton') + lib.count('*porkchop'));

// Step outside base to scan for animals towards South
try {
  await globalThis.passDoorOut();
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// Look for animals within 40m
const animals = Object.values(bot.entities).filter(e => 
  e && ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 40
);
console.log(`Animals visible outside: ${animals.length}`);
for (const a of animals.slice(0, 3)) {
  console.log(`Hunting ${a.name} at ${lib.fmt(a.position)}...`);
  try {
    await lib.goTo(a.position.x, a.position.y, a.position.z, 2, { timeoutMs: 10000 });
    for (let hit = 0; hit < 3; hit++) {
      if (!bot.entities[a.id]) break;
      await bot.lookAt(a.position.offset(0, 0.5, 0), true);
      await bot.attack(a);
      await sleep(650);
    }
    await lib.pickup(6);
  } catch (err) {
    console.log('Hunt error:', err.message);
  }
}

// 10. Return inside base
console.log('Returning inside base...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 15000 });
  await globalThis.passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Final position:', lib.fmt(bot.entity.position));
console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));
