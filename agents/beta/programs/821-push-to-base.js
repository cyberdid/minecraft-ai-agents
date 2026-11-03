// programs/821-push-to-base.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 821: Push to Base ===');
const p = bot.entity.position;
console.log(`Pos: ${lib.fmt(p)}`);

// Check blocks ahead at x=263..265, y=66..70, z=-60..-58
for (let dx = 1; dx <= 3; dx++) {
  const x = Math.floor(p.x) + dx;
  const line = [];
  for (let dy = -1; dy <= 2; dy++) {
    const y = Math.floor(p.y) + dy;
    const b = bot.blockAt(new Vec3(x, y, Math.floor(p.z)));
    line.push(`y${y}:${b ? b.name : 'null'}`);
  }
  console.log(`x=${x}: ${line.join(', ')}`);
}

// Equip pickaxe to dig any obstacles
const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Manual walk forward towards (293, 72, -55)
for (let step = 0; step < 10 && !isCancelled(); step++) {
  const cur = bot.entity.position;
  if (cur.distanceTo(new Vec3(293, 72, -55)) < 3.0) break;
  
  // Look towards base
  await bot.lookAt(new Vec3(293, cur.y + 1.5, -55), true);
  
  // Dig any block directly in front of head/body if solid
  const forwardVec = new Vec3(Math.cos(bot.entity.yaw), 0, Math.sin(bot.entity.yaw)).normalize();
  const frontFeet = bot.blockAt(cur.offset(0.7, 0, 0.2));
  const frontHead = bot.blockAt(cur.offset(0.7, 1, 0.2));
  
  if (frontHead && frontHead.boundingBox === 'block' && frontHead.name !== 'air') {
    try { await bot.dig(frontHead, true); } catch (e) {}
  }

  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
}

console.log('Pos after push:', lib.fmt(bot.entity.position));
