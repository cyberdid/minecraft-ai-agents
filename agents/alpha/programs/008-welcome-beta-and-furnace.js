// programs/008-welcome-beta-and-furnace.js
// Welcome beta, craft furnace, seal inner ceiling, place furnace

console.log('Current alpha pos:', bot.entity.position.x.toFixed(1), bot.entity.position.y.toFixed(1), bot.entity.position.z.toFixed(1));

// Check beta's position
const beta = bot.players['beta'];
if (beta && beta.entity) {
  const bp = beta.entity.position;
  console.log('beta pos:', bp.x.toFixed(1), bp.y.toFixed(1), bp.z.toFixed(1));
  // If beta is outside near door (z > -54), ensure door is open so beta can enter
  if (bp.z > -54 && Math.abs(bp.x - 294) < 3) {
    console.log('Beta near door outside, opening door...');
    await lib.door(294, 72, -54, true);
    await sleep(2000);
  }
}

// Craft furnace (costs 8 cobblestone)
if (lib.count('furnace') === 0 && lib.count('cobblestone') >= 8) {
  try {
    await lib.craft('furnace', 1);
    console.log('Crafted furnace!');
  } catch (e) {
    console.log('Craft furnace note:', e.message);
  }
}

// Place furnace inside at (293, 72, -57) if empty
try {
  if (lib.count('furnace') > 0) {
    const b = lib.blockAt(293, 72, -57);
    if (!b || b.boundingBox !== 'block') {
      await lib.place('furnace', 293, 72, -57);
      console.log('Furnace placed at (293, 72, -57)');
    }
  }
} catch (e) {
  console.log('Furnace place note:', e.message);
}

// Seal the 3x3 inner ceiling at y=75 (x: 293..295, z: -57..-55) if any are air
const innerCeiling = [];
for (let x = 293; x <= 295; x++) {
  for (let z = -57; z <= -55; z++) {
    const b = lib.blockAt(x, 75, z);
    if (!b || b.boundingBox !== 'block') {
      // Use cobblestone or dirt
      const matName = lib.count('cobblestone') > 0 ? 'cobblestone' : (lib.count('dirt') > 0 ? 'dirt' : null);
      if (matName) {
        innerCeiling.push({ x, y: 75, z, name: matName });
      }
    }
  }
}
console.log('Inner ceiling blocks needing placement:', innerCeiling.length);
if (innerCeiling.length > 0) {
  const r = await lib.build(innerCeiling, { replace: false });
  console.log('Inner ceiling build result:', JSON.stringify(r));
}

// Ensure door is closed once night hits
const time = lib.time();
if (time.night || time.secondsUntilNight < 10) {
  await lib.door(294, 72, -54, false);
  console.log('Door closed for night');
}

bot.chat('alpha: furnace crafted. Inner ceiling secured. Let us place chest and make torches.');

console.log('Status: hostiles nearby:', JSON.stringify(lib.hostiles(16)));
console.log('Time:', time.phase, 'ticks:', time.timeOfDay, 'night in:', time.secondsUntilNight);

return {
  furnace: lib.count('furnace'),
  time: time,
  hostiles: lib.hostiles(16)
};
