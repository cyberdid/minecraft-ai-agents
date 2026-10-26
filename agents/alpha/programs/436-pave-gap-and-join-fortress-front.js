// programs/436-pave-gap-and-join-fortress-front.js
console.log('=== Program 436: Pave Gap at z=-125 & Join Fortress Front ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Craft wooden sword
try {
  if (lib.count('wooden_sword') === 0 && lib.count('*_planks') >= 2) {
    await lib.craft('wooden_sword', 1);
    console.log('Crafted wooden_sword!');
  }
} catch (e) {}
await lib.equipWeapon();

// 2. Mine 32 netherrack right outside bunker (takes ~3s)
console.log('Mining 32 netherrack for bridge paving...');
const nbBlocks = bot.findBlocks({
  matching: b => b.name === 'netherrack',
  maxDistance: 8,
  count: 32
});

for (const nb of nbBlocks) {
  if (lib.count('netherrack') >= 32 || isCancelled()) break;
  if (nb.x === Math.floor(bot.entity.position.x) && nb.z === Math.floor(bot.entity.position.z)) continue;
  try { await lib.dig(nb.x, nb.y, nb.z); } catch (e) {}
}
await lib.pickup(6);
console.log('Netherrack count:', lib.count('netherrack'));

// Helper to clear fire
async function clearFireAhead() {
  const fires = bot.findBlocks({
    matching: b => b.name === 'fire' || b.name === 'soul_fire',
    maxDistance: 8,
    count: 8
  });
  for (const fp of fires) {
    try { await bot.dig(bot.blockAt(fp)); } catch (e) {}
  }
}

// 3. Announce advance
bot.chat('team: Alpha advancing along East Ridge trail with netherrack to pave gap at z=-125 and join Gamma at (44, 65, -142)!');

// 4. East Ridge Trail
try { await lib.goTo(63, 64, -3, 2, { timeoutMs: 20000 }); } catch (e) { try { await lib.goToXZ(63, -3); } catch (e2) {} }
try { await lib.goTo(62, 66, -30, 2, { timeoutMs: 20000 }); } catch (e) { try { await lib.goToXZ(62, -30); } catch (e2) {} }
await clearFireAhead();
try { await lib.goTo(61, 67, -60, 2, { timeoutMs: 20000 }); } catch (e) { try { await lib.goToXZ(61, -60); } catch (e2) {} }
await clearFireAhead();
try { await lib.goTo(54, 65, -90, 2, { timeoutMs: 25000 }); } catch (e) { try { await lib.goToXZ(54, -90); } catch (e2) {} }
await clearFireAhead();

// 5. Approach Fortress bridgehead at (47, 65, -120) — STOP BEFORE GAP!
console.log('Approaching gap sector at (47, 65, -120)...');
try {
  await lib.goTo(47, 65, -120, 1, { timeoutMs: 25000 });
} catch (e) {
  try { await lib.goToXZ(47, -120); } catch (e2) {}
}
console.log('At gap sector approach:', lib.fmt(bot.entity.position));

// 6. Inspect and pave floor at z=-123 to -127 along x=45 and x=44
console.log('Inspecting and paving bridge floor at z=-123..-127...');
const nr = bot.inventory.items().find(i => i.name === 'netherrack');
if (nr) await bot.equip(nr, 'hand');

for (let z = -122; z >= -127; z--) {
  for (const x of [45, 44]) {
    const floorPos = new Vec3(x, 64, z);
    const b = bot.blockAt(floorPos);
    if (!b || b.name === 'air') {
      console.log(`Gap detected at floor (${x}, 64, ${z})! Paving...`);
      try {
        const support = bot.blockAt(new Vec3(x, 64, z + 1)) || bot.blockAt(new Vec3(x + 1, 64, z));
        if (support && support.name !== 'air') {
          await bot.lookAt(floorPos.offset(0.5, 0.5, 0.5), true);
          await bot.placeBlock(support, new Vec3(0, 0, -1));
          await sleep(200);
        }
      } catch (err) {
        console.log(`Pave err at (${x},${z}):`, err.message);
      }
    }
  }
}

// 7. Walk safely into Fortress Workshop at (44, 65, -128)
console.log('Walking into Fortress Workshop (44, 65, -128)...');
try {
  await lib.goTo(44, 65, -128, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(44, -128); } catch (e2) {}
}

// 8. Advance through covered hallway to join Gamma at (44, 65, -142)
console.log('Advancing along covered tunnel to join Gamma at (44, 65, -142)...');
try {
  await lib.goTo(44, 65, -140, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(44, -140); } catch (e2) {}
}

console.log('Alpha reached position:', lib.fmt(bot.entity.position));
console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));

if (bot.entity.position.distanceTo(new Vec3(44, 65, -140)) < 8) {
  bot.chat(`team: Alpha safely united with Gamma at Fortress tunnel ${lib.fmt(bot.entity.position)}! Netherrack=${lib.count('netherrack')}. Ready for Blaze Spawner breach at (32, 68, -190)!`);
} else {
  bot.chat(`team: Alpha at ${lib.fmt(bot.entity.position)} along Nether trail. Advancing to (44, 65, -140)!`);
}
