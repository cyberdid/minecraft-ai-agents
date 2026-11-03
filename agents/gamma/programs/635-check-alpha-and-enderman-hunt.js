// programs/635-check-alpha-and-enderman-hunt.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 635: TEAM RADAR & SOUL SAND VALLEY ENDERMAN HUNT ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Maintain golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Scan all players
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
console.log(`Players tracked (${players.length}):`);
for (const p of players) {
  console.log(`- ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

// 3. Scan all Endermen within 96m
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 96
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Endermen tracked (${endermen.length}):`);
for (const em of endermen) {
  const dy = Math.abs(em.position.y - bot.entity.position.y);
  console.log(`- Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m, dY: ${dy.toFixed(1)}m`);
}

// 4. Scan Piglins within 48m
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 48
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
console.log(`Piglins tracked (${piglins.length}):`);
for (const pg of piglins) {
  const dy = Math.abs(pg.position.y - bot.entity.position.y);
  console.log(`- Piglin at ${lib.fmt(pg.position)}, dist: ${bot.entity.position.distanceTo(pg.position).toFixed(1)}m, dY: ${dy.toFixed(1)}m`);
}

// 5. Check if Alpha is within 12m to deliver golden_boots
const alpha = players.find(p => p.username === 'alpha');
if (alpha) {
  const dAlpha = bot.entity.position.distanceTo(alpha.position);
  if (dAlpha <= 6.0) {
    const extraBoots = bot.inventory.items().find(i => i.name === 'golden_boots' && i.slot !== 8);
    if (extraBoots) {
      console.log('Delivering golden_boots to Alpha!');
      await bot.lookAt(alpha.position.offset(0, 1.0, 0), true);
      await bot.tossStack(extraBoots);
      bot.chat('gamma: alpha: Golden boots delivered! Equip them on feet for 100% Piglin neutrality!');
      await sleep(500);
    }
  }
}

// 6. Report status
const pearls = lib.count('ender_pearl');
console.log(`=== END PROGRAM 635: Pearls=${pearls}/12, HP=${bot.health.toFixed(1)}, Food=${bot.food} ===`);
bot.chat(`gamma: Team sync — Bunker (44, 65, -130), Pearls: ${pearls}/12, Golden boots for Alpha ready in inventory!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls,
  players: players.map(p => ({ name: p.username, pos: p.position })),
  endermen: endermen.length,
  piglins: piglins.length
};
