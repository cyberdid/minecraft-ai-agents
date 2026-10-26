// programs/029-craft-shield-and-check-beta.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Craft Shield
console.log('Crafting shield from 1 iron_ingot and 6 planks...');
await lib.ensureTable();
await lib.craft('shield', 1);
console.log('Shield crafted! Count:', lib.count('shield'));

// 2. Equip Shield
await lib.equipArmor();
console.log('Equipped shield in off-hand!');

// 3. Check player positions
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

// 4. Check portal site at (298, 72, -54)
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
console.log(`Portal frame status: ${obsCount}/10 obsidian placed. Lit: ${isLit}`);

bot.chat(`gamma crafted and equipped shield! Portal status: ${obsCount}/10 obsidian. Beta at: ${bot.players.beta?.entity ? lib.fmt(bot.players.beta.entity.position) : 'unknown'}`);
