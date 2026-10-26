// programs/103-step-into-base-room.js
console.log('--- UNSTICK AND STEP INTO BASE ROOM ---');
console.log('Pos before:', bot.entity.position);

// Dig the block at (295, 73, -54) if solid
const b = bot.blockAt(new Vec3(295, 73, -54));
if (b && b.boundingBox === 'block') {
  console.log('Digging obstructing block at (295, 73, -54)...');
  try {
    await lib.dig(295, 73, -54);
    console.log('Dug block at (295, 73, -54)');
  } catch (e) {
    console.log('Dig note:', e.message);
  }
}

// Step into base center at (293.5, 72.0, -56.0)
console.log('Stepping into base interior (293.5, 72.0, -56.0)...');
try {
  await lib.walkTo(293.5, -56.0);
} catch (e) {}

console.log('Pos after:', bot.entity.position);
