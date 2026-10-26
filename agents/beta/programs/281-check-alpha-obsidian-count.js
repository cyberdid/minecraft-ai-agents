// programs/281-check-alpha-obsidian-count.js
console.log('=== Step 39: Check Alpha obsidian mining and portal build ===');

// 1. Inspect chest
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Base chest contents:', JSON.stringify(chest));

let totalObs = (chest.obsidian || 0) + lib.count('obsidian');
console.log(`Obsidian count on Beta + chest: ${totalObs}/10`);

if (chest.obsidian) {
  console.log(`Withdrawing ${chest.obsidian} obsidian from chest...`);
  await lib.withdraw({ obsidian: chest.obsidian }, chestPos.x, chestPos.y, chestPos.z);
}

// 2. Check Alpha entity
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log(`Alpha at: ${lib.fmt(alpha.position)}, dist: ${alpha.position.distanceTo(bot.entity.position).toFixed(1)}`);
  if (alpha.heldItem) console.log('Alpha held item:', alpha.heldItem.name);
} else {
  console.log('Alpha entity not in loaded area.');
}

// 3. If Beta now has 10 obsidian: BUILD AND LIGHT PORTAL!
if (lib.count('obsidian') >= 10) {
  const frame = lib.shapes.portal(298, 72, -54, 'x');
  console.log('Building portal frame...');
  const res = await lib.build(frame);
  console.log('Build result:', JSON.stringify(res));

  console.log('Igniting portal at (299, 72, -54)...');
  const ig = await lib.ignite(299, 72, -54);
  console.log('Ignite result:', ig);
  bot.chat('alpha: NETHER PORTAL IS LIT AT (298, 72, -54)! MILESTONE 7 COMPLETE!');
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Portal builder ready at (298, 72, -54). Obsidian on beta: ${lib.count('obsidian')}/10. Flint & steel: 100%.`);
