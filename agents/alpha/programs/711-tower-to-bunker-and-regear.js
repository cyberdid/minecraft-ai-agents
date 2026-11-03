// programs/711-tower-to-bunker-and-regear.js
console.log('=== Program 711: Ascend to Bunker & Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain active shield
bot.activateItem(true);
globalThis.configureFireAvoidance();

// Configure movements: allow digging and towering with cobblestone
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.allowParkour = true;
netherMoves.maxDropDown = 4;
bot.pathfinder.setMovements(netherMoves);

// 2. Clear head clearance at y=52, 53, 54 before towering
const cur = bot.entity.position.floored();
for (let dy = 2; dy <= 4; dy++) {
  const headPos = cur.offset(0, dy, 0);
  const b = bot.blockAt(headPos);
  if (b && b.name !== 'air' && b.name !== 'cave_air') {
    try {
      const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(b);
      console.log(`Dug overhead block at ${lib.fmt(headPos)}`);
    } catch (e) {}
  }
}

// 3. Tower up with cobblestone to y=64
console.log('Towering up to y=64...');
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'netherrack');
if (cobble) {
  while (bot.entity.position.y < 63.5 && !checkCancelled()) {
    // Dig above if blocked
    const head = bot.entity.position.offset(0, 2.2, 0).floored();
    const b = bot.blockAt(head);
    if (b && b.name !== 'air' && b.name !== 'cave_air') {
      try {
        const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
        if (pick) await bot.equip(pick, 'hand');
        await bot.dig(b);
      } catch (e) {}
    }

    // Jump and place under feet
    const jumpItem = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'netherrack');
    if (!jumpItem) break;
    await bot.equip(jumpItem, 'hand');

    bot.setControlState('jump', true);
    await sleep(350);
    bot.setControlState('jump', false);

    const placePos = bot.entity.position.offset(0, -1, 0).floored();
    try {
      const refBlock = bot.blockAt(placePos.offset(0, -1, 0)) || bot.blockAt(placePos.offset(1, 0, 0));
      if (refBlock) {
        await bot.placeBlock(refBlock, new Vec3(0, 1, 0));
      }
    } catch (e) {}
    await sleep(150);
  }
}

console.log('Tower complete. Pos:', lib.fmt(bot.entity.position));

// 4. Walk to Nether portal at (45, 66, 2) or bunker at (41, 65, -6)
if (bot.entity.position.y >= 62) {
  console.log('Walking towards Nether portal bunker (41, 65, -6)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(41.0, 65.0, -6.0, 1.5));
  } catch (e) {
    try { await lib.goTo(41, 65, -6, 2.0, { dig: true, timeoutMs: 8000 }); } catch (e2) {}
  }
}

console.log('Alpha now at:', lib.fmt(bot.entity.position));

// 5. Check if Gamma or Crafting Table is right here
const table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 8 });
console.log('Crafting table nearby:', table ? lib.fmt(table.position) : 'none');

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}

// 6. If near Nether portal and we want to retrieve the Base Chest gold ingot:
// Step into Nether Portal to warp to Overworld Base
const netherPortal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
console.log('Nether portal block nearby:', netherPortal ? lib.fmt(netherPortal.position) : 'none');

if (netherPortal && bot.game.dimension === 'the_nether') {
  console.log('Stepping into Nether portal to access Overworld Base Chest...');
  bot.chat('alpha: Stepping into portal to retrieve gold ingot from Base Chest and heal at base!');
  
  try {
    await bot.pathfinder.goto(new goals.GoalNear(netherPortal.position.x, netherPortal.position.y, netherPortal.position.z, 0.5));
  } catch (e) {}

  const warpStart = Date.now();
  while (bot.game.dimension === 'the_nether' && Date.now() - warpStart < 20000 && !checkCancelled()) {
    await sleep(300);
  }
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 7. If in Overworld:
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Walking to Base Chest at (293, 72, -57)...');
  // Open base door if needed
  if (bot.entity.position.z > -54.0) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  // Open chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openContainer(chestBlock);
      console.log('Base Chest items:');
      for (const item of chest.containerItems()) {
        console.log(` - ${item.name} x ${item.count}`);
        if (item.name === 'gold_ingot' || item.name === 'gold_nugget') {
          await chest.withdraw(item.type, null, item.count);
          console.log(`Withdrew ${item.name} x${item.count} from Base Chest!`);
        }
      }
      chest.close();
    } catch (e) {
      console.log('Chest error:', e.message);
    }
  }

  // Sleep if night
  if (lib.time().canSleep) {
    console.log('Night in Overworld! Sleeping to reset HP & Food to 20/20...');
    try { await lib.sleepInBed(); } catch (e) {}
  }

  // Craft golden_boots if Alpha now has 4+ ingots
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    try {
      await lib.craft('golden_boots', 1);
      const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
      if (gb) await bot.equip(gb, 'feet');
      bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped at Base! 100% Piglin neutrality ACTIVE!');
    } catch (e) {}
  }

  bot.chat(`alpha: Base visit complete. Golden Boots: ${bot.inventory.slots[8]?.name === 'golden_boots' ? 'YES' : 'NO'}, Gold Ingots: ${lib.count('gold_ingot')}, HP: ${bot.health}`);
}

console.log('=== Program 711 Finished ===');
console.log('Final Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Inv:', lib.inv());
