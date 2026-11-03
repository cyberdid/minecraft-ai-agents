// programs/670-inspect-floor-and-bridge.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 670: INSPECT FLOOR HEIGHTS & BRIDGE ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'onGround:', bot.entity.onGround);

// Inspect column at current pos and ahead (x=50 down to x=40)
for (let x = 51; x >= 40; x--) {
  let col = `x=${x}: `;
  for (let y = 67; y >= 62; y--) {
    const b = bot.blockAt(new Vec3(x, y, -6));
    if (b && b.boundingBox === 'block') {
      col += `[y=${y}:${b.name}] `;
    }
  }
  console.log(col);
}

return { pos: bot.entity.position };
