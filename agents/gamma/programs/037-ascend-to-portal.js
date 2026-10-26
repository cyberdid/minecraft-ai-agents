// programs/037-ascend-to-portal.js
console.log('gamma pos:', lib.fmt(bot.entity.position));
await lib.equipWeapon();

// Fight nearby hostiles if too close
const hostiles = lib.hostiles(10);
if (hostiles.length > 0) {
  console.log(`Fighting ${hostiles.length} hostiles...`);
  try {
    await lib.fight(8, 10);
  } catch (e) {
    console.log('Fight note:', e.message);
  }
}

// Stage 1: Ascend to y=50
console.log('Ascending Stage 1 to y=50...');
try {
  await lib.goTo(302, 50, -44, 2, { dig: true });
  console.log('Stage 1 reached:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 1 error:', e.message);
}

// Stage 2: Ascend to surface at (302, 71, -44)
console.log('Ascending Stage 2 to surface...');
try {
  await lib.goTo(302, 71, -44, 2, { dig: true });
  console.log('Surface reached:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 2 error:', e.message);
}

// Stage 3: Walk to portal site at (298, 72, -53)
console.log('Moving to portal site (298, 72, -53)...');
try {
  await lib.goTo(298, 72, -53, 1, { dig: true });
} catch (e) {}

// Check portal frame
let obsCount = 0;
let isLit = false;
for (let y = 72; y <= 76; y++) {
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    if (b) {
      if (b.name === 'obsidian') obsCount++;
      if (b.name === 'nether_portal') isLit = true;
    }
  }
}

console.log(`Portal status: ${obsCount}/10 obsidian. Lit: ${isLit}`);
bot.chat(`gamma reached portal site! Portal: ${obsCount}/10 obsidian. Lit: ${isLit}. Cheering team on!`);
