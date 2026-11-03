// programs/891-warp-to-overworld-and-eat.js
console.log('=== Program 891: Warp to Overworld Base & Replenish Food ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

console.log('Current pos in Nether:', lib.fmt(bot.entity.position), 'food:', bot.food);

// 1. Locate nether_portal block
const portalBlock = bot.findBlock({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 12
});

if (portalBlock) {
  console.log(`Found portal block at ${lib.fmt(portalBlock.position)}, stepping inside...`);
  const pos = portalBlock.position;
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(pos.x, pos.y, pos.z));
  } catch (e) {
    await bot.lookAt(pos.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
  }

  // Stand completely still inside portal frame
  bot.clearControlStates();
  bot.pathfinder.stop();

  console.log('Standing inside portal frame waiting for warp...');
  const start = Date.now();
  while (bot.game.dimension === 'the_nether' && Date.now() - start < 15000 && !checkCancelled()) {
    await sleep(250);
  }
}

console.log(`Dimension after warp: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension === 'overworld') {
  bot.chat('Beta: Arrived in Overworld base! Replenishing food now!');

  // Step out of portal into base
  try {
    await lib.goTo(294, 72, -55, 1.2, { timeoutMs: 8000 });
  } catch (e) {}

  // Check for sheep or cows right outside door
  console.log('Checking for nearby animals to hunt...');
  const animals = Object.values(bot.entities).filter(e =>
    e.isValid && ['sheep', 'cow', 'pig', 'chicken'].includes(e.name) &&
    bot.entity.position.distanceTo(e.position) <= 32
  );
  console.log(`Found ${animals.length} animals nearby:`, animals.map(a => a.name));

  if (animals.length > 0) {
    const targetType = animals[0].name;
    console.log(`Hunting ${targetType}...`);
    try {
      await lib.hunt(targetType, 2);
    } catch (e) {
      console.log(`Hunt note: ${e.message}`);
    }
  }

  // Check if we have raw meat or cooked food in inventory
  console.log('Inventory check:', JSON.stringify(lib.inv()));
  const rawMeat = bot.inventory.items().find(i =>
    ['raw_mutton', 'raw_beef', 'raw_porkchop', 'raw_chicken'].includes(i.name)
  );

  if (rawMeat) {
    console.log(`Smelting ${rawMeat.name} in furnace...`);
    const fb = bot.blockAt(new Vec3(295, 72, -55));
    if (fb) {
      try {
        const f = await bot.openFurnace(fb);
        await f.putInput(rawMeat.type, null, rawMeat.count);
        // Put coal if empty
        if (!f.fuelItem() && lib.count('coal') > 0) {
          const coal = bot.inventory.items().find(i => i.name === 'coal');
          if (coal) await f.putFuel(coal.type, null, 2);
        }
        await sleep(10500); // 1 item cooked
        if (f.outputItem()) await f.takeOutput();
        f.close();
      } catch (err) {
        console.log(`Furnace error: ${err.message}`);
      }
    }
  }

  // Consume any cooked food in inventory
  for (const item of bot.inventory.items()) {
    if (item.name.startsWith('cooked_') || item.name === 'bread' || item.name === 'apple') {
      console.log(`Consuming ${item.name}...`);
      await bot.equip(item, 'hand');
      await bot.consume();
    }
  }

  // Ensure golden boots stay on feet!
  if (bot.inventory.slots[8]?.name !== 'golden_boots') {
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
  }

  console.log(`Status after feed: Food=${bot.food}, HP=${bot.health}`);
  bot.chat(`Beta: Food replenished to ${bot.food}/20! Warping back to Nether!`);

  // Warp back to Nether
  await enterNetherPortal(20000);
}

console.log(`Final dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health
};
