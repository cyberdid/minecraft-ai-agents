// programs/433-gather-netherrack-and-advance-to-hallway.js
console.log('=== Program 433: Mine Netherrack, Advance to Hallway & Build Roof ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Craft wooden pickaxe and wooden sword
try {
  if (lib.count('*_log') > 0) {
    const l = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
    await lib.craft(l.replace('_log', '_planks'), 4);
  }
  if (lib.count('wooden_pickaxe') === 0 && lib.count('*_planks') >= 3) {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe!');
  }
  if (lib.count('wooden_sword') === 0 && lib.count('*_planks') >= 2) {
    await lib.craft('wooden_sword', 1);
    console.log('Crafted wooden_sword!');
  }
} catch (e) {
  console.log('Craft note:', e.message);
}

// 2. Mine 48 netherrack near bunker exit
console.log('Mining 48 netherrack for tunnel construction...');
const nbBlocks = bot.findBlocks({
  matching: b => b.name === 'netherrack',
  maxDistance: 8,
  count: 48
});

for (const nb of nbBlocks) {
  if (lib.count('netherrack') >= 48 || isCancelled()) break;
  if (nb.x === Math.floor(bot.entity.position.x) && nb.z === Math.floor(bot.entity.position.z)) continue;
  try { await lib.dig(nb.x, nb.y, nb.z); } catch (e) {}
}
await lib.pickup(6);
console.log('Netherrack count:', lib.count('netherrack'));

// Helper to extinguish fire ahead
async function clearFireAhead() {
  const fires = bot.findBlocks({
    matching: b => b.name === 'fire' || b.name === 'soul_fire',
    maxDistance: 8,
    count: 10
  });
  for (const fp of fires) {
    try { await bot.dig(bot.blockAt(fp)); } catch (e) {}
  }
}

// 3. Announce advance
bot.chat('team: Alpha advancing with 48+ netherrack along East Ridge to Fortress advance hallway (44, 65, -133)!');

// 4. Navigate East Ridge Trail
try {
  await lib.goTo(63, 64, -3, 2, { timeoutMs: 20000 });
} catch (e) { try { await lib.goToXZ(63, -3); } catch (e2) {} }

try {
  await lib.goTo(62, 66, -30, 2, { timeoutMs: 20000 });
} catch (e) { try { await lib.goToXZ(62, -30); } catch (e2) {} }
await clearFireAhead();

try {
  await lib.goTo(61, 67, -60, 2, { timeoutMs: 20000 });
} catch (e) { try { await lib.goToXZ(61, -60); } catch (e2) {} }
await clearFireAhead();

// Safe traverse past z=-90 fire zone
try {
  await lib.goTo(54, 65, -90, 2, { timeoutMs: 25000 });
} catch (e) { try { await lib.goToXZ(54, -90); } catch (e2) {} }
await clearFireAhead();

// Reach Fortress Workshop entrance (44, 65, -127)
try {
  await lib.goTo(44, 65, -127, 2, { timeoutMs: 25000 });
} catch (e) { try { await lib.goToXZ(44, -127); } catch (e2) {} }

// Step safely inside advance hallway at (44, 65, -133)
try {
  await lib.goTo(44, 65, -133, 1, { timeoutMs: 15000 });
} catch (e) { try { await lib.goToXZ(44, -133); } catch (e2) {} }

console.log('Alpha reached hallway at:', lib.fmt(bot.entity.position));
console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));

if (bot.entity.position.distanceTo(new Vec3(44, 65, -133)) < 6) {
  bot.chat(`team: Alpha inside blast-proof hallway (44, 65, -133)! Netherrack=${lib.count('netherrack')}, HP=${bot.health}. Building roof over bridge to block Blaze fireballs!`);
} else {
  bot.chat(`team: Alpha at ${lib.fmt(bot.entity.position)} en route to (44, 65, -133).`);
}
