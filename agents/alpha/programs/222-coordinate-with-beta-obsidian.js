// programs/222-coordinate-with-beta-obsidian.js
console.log('=== Program 222: Coordinate with Beta & Prep for Obsidian ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check Beta status
const beta = bot.players.beta;
if (beta && beta.entity) {
  console.log('Beta pos:', lib.fmt(beta.entity.position), 'held:', beta.entity.heldItem?.name);
} else {
  console.log('Beta not in render distance');
}

// 2. Craft stone tools for Alpha (sword & pickaxe)
try {
  if (lib.count('stick') < 4 && lib.count('birch_planks') >= 2) {
    await lib.craft('stick', 4);
  }
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
    await lib.craft('stone_pickaxe', 1);
  }
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
    await lib.craft('stone_sword', 1);
  }
} catch (e) {
  console.log('Craft tools note:', e.message);
}

// 3. Move to base entrance (294, 72, -52) / Portal site (298, 72, -54)
console.log('Moving towards base/portal site...');
try {
  await lib.goTo(294, 72, -52, 2, { timeoutMs: 25000 });
} catch (e) {
  console.log('Move note:', e.message);
}

// Inspect portal frame site at (298, 72, -54)
const portalFrame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(portalFrame);
console.log('Portal frame status:', JSON.stringify(mat));

bot.chat('beta: Fantastic recovery of diamond_pickaxe and water_bucket! I am at base/portal site with cobblestone ready. Go to lava lake (286, 18, 8) or let me know if you need assistance!');

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
