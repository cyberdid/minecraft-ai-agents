// programs/247-inspect-base-interior-and-plan.js
console.log('=== Step 5: Detailed interior scan of base ===');

const baseBlocks = [];
for (let y = 71; y <= 74; y++) {
  for (let z = -58; z <= -54; z++) {
    for (let x = 292; x <= 296; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        baseBlocks.push(`(${x},${y},${z}): ${b.name}`);
      }
    }
  }
}
console.log('Base non-air blocks:\n' + baseBlocks.join('\n'));

console.log('Beta pos:', lib.fmt(bot.entity.position));
console.log('Alpha pos:', bot.players['alpha']?.entity ? lib.fmt(bot.players['alpha'].entity.position) : 'unknown');
console.log('Time:', lib.time());

bot.chat('alpha: Safe inside base. What resources do you have in inventory?');
