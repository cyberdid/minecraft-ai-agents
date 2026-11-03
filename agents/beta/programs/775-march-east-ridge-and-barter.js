// programs/775-march-east-ridge-and-barter.js
console.log('=== Program 775: March East Ridge & Barter with Piglins ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Gold ingots on Beta:', lib.count('gold_ingot'));
console.log('Wearing feet slot:', bot.inventory.slots[8]?.name);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden_boots equipped
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

// Equip stone pickaxe in hand, shield in offhand
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// Configure movements: strictly avoid fire/soul_fire/lava, but allow digging terrain
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

// Active fire clearing helper
async function clearAllFireNearby() {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 6.0,
    count: 10
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
}

const eastRidgeWaypoints = [
  new Vec3(50, 65, -7),
  new Vec3(56, 65, -7),
  new Vec3(63, 64, -7),
  new Vec3(63, 65, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(62, 67, -65)
];

let bartersDone = 0;
let minedOres = 0;
let initialPearls = lib.count('ender_pearl');

for (let i = 0; i < eastRidgeWaypoints.length && !isCancelled(); i++) {
  const wp = eastRidgeWaypoints[i];
  console.log(`Advancing to East Ridge WP ${i + 1}/${eastRidgeWaypoints.length}: ${lib.fmt(wp)}...`);
  await clearAllFireNearby();

  if (wp.z <= -50) {
    bot.activateItem(true); // Raise shield against fireballs
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try {
      await clearAllFireNearby();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.8));
    } catch (e2) {}
  }

  await clearAllFireNearby();
  console.log(`Arrived near WP ${i + 1}. Current pos: ${lib.fmt(bot.entity.position)}`);

  // Scan for adult Piglins within 20m
  const piglins = Object.values(bot.entities).filter(e =>
    e.name === 'piglin' &&
    e.isValid &&
    bot.entity.position.distanceTo(e.position) <= 20
  );

  if (piglins.length > 0 && lib.count('gold_ingot') > 0) {
    piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
    const targetPiglin = piglins[0];
    console.log(`Found Piglin at ${lib.fmt(targetPiglin.position)}! Distance: ${bot.entity.position.distanceTo(targetPiglin.position).toFixed(1)}m`);
    bot.chat('Beta: Approaching neutral Piglin on East Ridge for bartering!');

    try {
      await bot.pathfinder.goto(new goals.GoalNear(targetPiglin.position.x, targetPiglin.position.y, targetPiglin.position.z, 3.5));
      await bot.lookAt(targetPiglin.position.offset(0, 1.2, 0), true);
      console.log('Tossing gold ingot to Piglin...');
      await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
      bartersDone++;

      console.log('Holding position for 8s while Piglin barters...');
      bot.activateItem(true);
      await sleep(8000);
      bot.deactivateItem();

      await lib.pickup(5.0);
      const newPearls = lib.count('ender_pearl');
      console.log(`Ender pearls count now: ${newPearls}`);
      if (newPearls > initialPearls) {
        bot.chat(`Beta: GOT ENDER PEARL FROM BARTER! Total: ${newPearls}/12!`);
        initialPearls = newPearls;
      }
    } catch (e) {
      console.log('Barter note:', e.message);
    }
  }

  // Scan for nether_gold_ore within 10m
  const localOres = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 10,
    count: 3
  }).filter(p => p.y >= 62);

  for (const op of localOres) {
    if (isCancelled()) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2.2));
      const b = bot.blockAt(op);
      if (b && b.name === 'nether_gold_ore') {
        const curPick = bot.inventory.items().find(it => it.name.includes('pickaxe'));
        if (curPick) await bot.equip(curPick, 'hand');
        await bot.dig(b);
        minedOres++;
        await sleep(200);
        await lib.pickup(3.5);
      }
    } catch (e) {}
  }

  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}), holding at safe cover.`);
    break;
  }
}

await lib.pickup(5.0);
bot.activateItem(true); // Keep shield raised at end of program

console.log('=== Program 775 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls:', lib.count('ender_pearl'));
console.log('Gold ingots:', lib.count('gold_ingot'), 'nuggets:', lib.count('gold_nugget'));
console.log('Barters performed:', bartersDone, 'Ores mined:', minedOres);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget'),
  barters_done: bartersDone,
  mined_ores: minedOres
};
