// programs/273-welcome-alpha-and-prep-portal.js
console.log('=== Step 31: Inspect portal site and coordinate with Alpha ===');

// 1. Inspect portal site at (298, 72, -54)
const portalFrame = lib.shapes.portal(298, 72, -54, 'x');
const portalMats = lib.materials(portalFrame);
console.log('Portal blueprint materials report:', JSON.stringify(portalMats));

// 2. Check blocks currently at portal frame positions
const frameStatus = [];
for (const b of portalFrame) {
  const current = bot.blockAt(new Vec3(b.x, b.y, b.z));
  frameStatus.push(`(${b.x},${b.y},${b.z}): current=${current?.name || 'air'} (wants ${b.name})`);
}
console.log('Portal frame block status:\n' + frameStatus.join('\n'));

// 3. Check Alpha
const alpha = bot.players['alpha'];
if (alpha && alpha.entity) {
  console.log('Alpha position:', lib.fmt(alpha.entity.position), 'distance:', alpha.entity.position.distanceTo(bot.entity.position).toFixed(1));
  if (alpha.entity.heldItem) {
    console.log('Alpha held item:', alpha.entity.heldItem.name);
  }
} else {
  console.log('Alpha entity not yet visible.');
}

// 4. Check chest contents
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Base chest contents:', JSON.stringify(chest));

console.log('Beta inventory:', JSON.stringify(lib.inv()));
console.log('Beta tools:', JSON.stringify(lib.tools()));
console.log('Time left until night:', lib.time().secondsUntilNight);

bot.chat(`beta: Portal site inspected: needs ${JSON.stringify(portalMats.need)}. Flint & steel and water bucket ready!`);
