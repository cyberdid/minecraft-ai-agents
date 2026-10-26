// programs/297-check-ahead-and-beta.js
console.log('=== Program 297: Check Ahead & Beta Progress ===');

// Check block at feet, head, floor at (336, 22, -68) and (336, 22, -67)
for (let z = -68; z >= -65; z--) {
  const pFeet = new Vec3(336, 22, z);
  const pHead = pFeet.offset(0, 1, 0);
  const pFloor = pFeet.offset(0, -1, 0);
  console.log(`z=${z}: floor=${bot.blockAt(pFloor)?.name}, feet=${bot.blockAt(pFeet)?.name}, head=${bot.blockAt(pHead)?.name}`);
}

// Step forward to (336, 22, -68)
bot.setControlState('forward', true);
await sleep(400);
bot.setControlState('forward', false);
console.log('Pos after step:', lib.fmt(bot.entity.position));

// Check Beta
if (bot.players.beta?.entity) {
  console.log('Beta pos:', lib.fmt(bot.players.beta.entity.position), 'held:', bot.players.beta.entity.heldItem?.name);
}
