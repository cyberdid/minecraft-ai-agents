// programs/640-handover-boots-to-alpha.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 640: HANDOVER GOLDEN BOOTS TO ALPHA & EXPEDITION SYNC ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

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

// 2. Wait for Alpha to approach Portal Camp
bot.chat('gamma: alpha: Standing at Portal Camp (42, 65, -6) with golden_boots in hand for you!');

const startWait = Date.now();
let alphaDelivered = false;

while (Date.now() - startWait < 20000 && !alphaDelivered && !isCancelled()) {
  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
  const alpha = players.find(p => p.username === 'alpha');
  
  if (alpha) {
    const dist = bot.entity.position.distanceTo(alpha.position);
    console.log(`Alpha dist: ${dist.toFixed(1)}m at ${lib.fmt(alpha.position)}`);

    if (dist <= 5.0) {
      const extraBoots = bot.inventory.items().find(i => i.name === 'golden_boots' && i.slot !== 8);
      if (extraBoots) {
        console.log('Tossing golden_boots to Alpha!');
        await bot.lookAt(alpha.position.offset(0, 1.0, 0), true);
        await bot.tossStack(extraBoots);
        bot.chat('gamma: alpha: Golden boots tossed at your feet! Equip on feet for 100% Piglin neutrality!');
        alphaDelivered = true;
        await sleep(1500);
        break;
      } else {
        console.log('No extra golden boots found in inventory (only wearing one).');
        break;
      }
    } else {
      // Look towards Alpha
      await bot.lookAt(alpha.position.offset(0, 1.0, 0), true);
    }
  }
  await sleep(500);
}

// 3. Scan for nearby Endermen in Soul Sand Valley
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 64
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Endermen in vicinity: ${endermen.length}`);
for (const em of endermen) {
  console.log(`- Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}

// 4. Scan Piglins within 32m
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 32
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Piglins within 32m: ${piglins.length}`);

// 5. Final report
const curPearls = lib.count('ender_pearl');
console.log(`=== END PROGRAM 640: Pearls=${curPearls}/12, BootsDelivered=${alphaDelivered}, HP=${bot.health.toFixed(1)} ===`);
console.log('Inventory:', lib.inv());

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  alphaDelivered,
  pearls: curPearls,
  inv: lib.inv()
};
