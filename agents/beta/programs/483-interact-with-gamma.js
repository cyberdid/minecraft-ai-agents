// programs/483-interact-with-gamma.js
console.log('=== Step: Interact with Gamma & Prepare Gear ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Gamma dist:', bot.players['gamma']?.entity ? bot.entity.position.distanceTo(bot.players['gamma'].entity.position).toFixed(1) + 'm' : 'none');

// 1. Check door block at (294, 72, -54)
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door block at (294, 72, -54):', doorBlock?.name);

// If air and we have oak_door, place it
if (doorBlock?.name === 'air' && lib.count('oak_door') > 0) {
  try {
    await lib.place('oak_door', 294, 72, -54);
    console.log('Placed oak door at (294, 72, -54)!');
  } catch (e) {
    console.log('Door place error:', e.message);
  }
}

// 2. Chat to Gamma asking for spare cobblestone or tools
bot.chat('gamma: please toss 10 cobblestone and 4 logs to beta! Standing right next to you at (294, 72, -55)!');

// 3. Wait 5 seconds and pick up any drops
for (let i = 0; i < 5; i++) {
  await sleep(1000);
  const drops = Object.values(bot.entities).filter(e => 
    e.name === 'item' && bot.entity.position.distanceTo(e.position) < 4
  );
  for (const d of drops) {
    try {
      await lib.goTo(d.position.x, d.position.y, d.position.z, 0.4);
      console.log(`Picked up drop at ${lib.fmt(d.position)}!`);
    } catch (e) {}
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
