// programs/529-escape-5m-creeper.js
console.log('=== EMERGENCY: Escape 5m Creeper into Base Shelter ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.pathfinder.stop();
await sleep(100);

// Look away from creeper towards base door (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
await bot.lookAt(doorPos.offset(0, 1, 0), true);

// Sprint forward towards base door
bot.setControlState('forward', true);
bot.setControlState('sprint', true);
bot.setControlState('jump', true);

for (let i = 0; i < 6; i++) {
  await sleep(400);
  const d = bot.entity.position.distanceTo(doorPos);
  console.log(`Sprinting... current pos: ${lib.fmt(bot.entity.position)}, dist to door: ${d.toFixed(1)}m`);
  if (d < 3.0) break;
}

bot.clearControlStates();

// Pass through base door
console.log('Passing through base door...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('SUCCESS: Inside base via door! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door note:', e.message);
  try { await lib.goTo(292, 72, -56, 1); } catch (e2) {}
}

// Make sure door is closed
const doorBlock = bot.blockAt(doorPos) || bot.findBlock({ matching: b => b.name.includes('door'), maxDistance: 4 });
if (doorBlock && doorBlock._properties && doorBlock._properties.open) {
  try { await lib.door(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z, false); } catch (e) {}
}

const hostiles = lib.hostiles(16);
console.log('Hostiles now within 16m:', hostiles.map(h => `${h.name} (${h.dist.toFixed(1)}m)`).join(', ') || 'none');
console.log('Final Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
