// programs/031-fight-zombie-and-meet-beta.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Equip stone sword
await lib.equipWeapon();

// 2. Check hostiles
const hostiles = lib.hostiles(16);
console.log('Hostiles within 16m:', JSON.stringify(hostiles));

for (const h of hostiles) {
  if (h.name === 'zombie' && h.dist < 8) {
    console.log('Fighting zombie at distance:', h.dist);
    try {
      await lib.fight(8, 10);
    } catch (e) {
      console.log('Fight note:', e.message);
    }
  } else if (h.name === 'creeper' && h.dist < 6) {
    console.log('Creeper too close! Backing away...');
    // Step away along +z (towards -34)
    await lib.walkTo(bot.entity.position.x, bot.entity.position.z - 3);
  }
}

// 3. Meet Beta
const targetPos = new Vec3(304, 20, -32);
console.log(`Walking down stairs toward Beta at ${lib.fmt(targetPos)}...`);

try {
  await lib.goTo(targetPos.x, targetPos.y, targetPos.z, 2, { dig: true, timeoutMs: 25000 });
  console.log('Reached vicinity of Beta at:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('goTo Beta note:', err.message);
}

// Check Beta
const beta = bot.players.beta?.entity;
if (beta) {
  console.log(`Beta at ${lib.fmt(beta.position)} (dist: ${beta.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
  bot.chat('delta: Beta with me! Ascending shaft to the base portal site (298, 72, -54)!');
  
  // Lead Beta up
  const ascentStages = [
    { x: 299, y: 32, z: -30 },
    { x: 304, y: 54, z: -34 },
    { x: 302, y: 71, z: -44 }
  ];
  for (const st of ascentStages) {
    if (isCancelled()) break;
    console.log(`Ascending to stage (${st.x}, ${st.y}, ${st.z})...`);
    try {
      await lib.goTo(st.x, st.y, st.z, 2, { timeoutMs: 20000 });
    } catch (e) {
      console.log('Ascent note:', e.message);
    }
  }
} else {
  console.log('Beta not within view distance yet.');
}

console.log('Delta pos now:', lib.fmt(bot.entity.position));
