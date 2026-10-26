// programs/315-walk-to-skeleton.js
console.log('=== Program 315: Walk to Skeleton ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health);

const skel = Object.values(bot.entities).find(e => e.name === 'skeleton' && bot.entity.position.distanceTo(e.position) < 16);
if (skel) {
  console.log(`Found skeleton at ${lib.fmt(skel.position)}, dist=${bot.entity.position.distanceTo(skel.position).toFixed(1)}m`);
  
  // Look at skeleton and walk directly towards it
  await bot.lookAt(skel.position.offset(0, 1.5, 0));
  bot.setControlState('forward', true);
  
  // Wait up to 10s for skeleton to hit us and trigger respawn
  for (let i = 0; i < 10; i++) {
    if (bot.health >= 18) {
      console.log('RESPAWNED AT BASE! Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);
      break;
    }
    console.log(`[t=${i}s] Pos: ${lib.fmt(bot.entity.position)}, Health: ${bot.health}`);
    await sleep(1000);
  }
  bot.setControlState('forward', false);
} else {
  console.log('No skeleton found nearby');
}
