// programs/276-watch-portal-and-alpha-obsidian.js
console.log('=== Step 34: Monitor Alpha obsidian mining & portal readiness ===');

// Check portal frame materials
const frame = lib.shapes.portal(298, 72, -54, 'x');
console.log('Portal frame materials currently needed:', JSON.stringify(lib.materials(frame)));

// Check Alpha status
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log(`Alpha at: ${lib.fmt(alpha.position)}, distance: ${alpha.position.distanceTo(bot.entity.position).toFixed(1)}`);
  if (alpha.heldItem) console.log('Alpha holding:', alpha.heldItem.name);
}

// Check chest
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

let totalObs = (chest.obsidian || 0) + lib.count('obsidian');
console.log(`Current obsidian on Beta + chest: ${totalObs}`);

// If chest has obsidian, withdraw it
if (chest.obsidian) {
  console.log(`Withdrawing ${chest.obsidian} obsidian from chest...`);
  await lib.withdraw({ obsidian: chest.obsidian }, chestPos.x, chestPos.y, chestPos.z);
  totalObs = lib.count('obsidian');
}

// If Beta holds 10 obsidian, BUILD AND LIGHT THE PORTAL!
if (lib.count('obsidian') >= 10) {
  console.log('Building portal frame at (298, 72, -54)...');
  const buildReport = await lib.build(frame);
  console.log('Portal build report:', JSON.stringify(buildReport));

  console.log('Igniting Nether portal at (299, 72, -54)...');
  const igniteResult = await lib.ignite(299, 72, -54);
  console.log('Ignite result:', igniteResult);
  bot.chat('alpha: NETHER PORTAL IS LIT AT (298, 72, -54)! MILESTONE 7 COMPLETE!');
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Standing by at portal frame (298, 72, -54) with flint & steel. Alpha obsidian count: waiting. Night in ${lib.time().secondsUntilNight}s.`);
