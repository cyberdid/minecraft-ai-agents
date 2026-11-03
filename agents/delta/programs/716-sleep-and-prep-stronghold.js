console.log('=== PROGRAM 716: SLEEP & PREP FOR STRONGHOLD EXPEDITION ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

// 1. Deposit junk clutter into Base Chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);

if (chestBlock) {
  try {
    console.log('Opening Base Chest to deposit clutter...');
    const chest = await bot.openContainer(chestBlock);

    // Deposit junk
    const junkNames = ['soul_sand', 'soul_soil', 'netherrack', 'stick', 'oak_log', 'oak_planks', 'wooden_pickaxe'];
    for (const j of junkNames) {
      const it = bot.inventory.items().find(i => i.name === j);
      if (it) {
        try {
          await chest.deposit(it.type, null, it.count);
          console.log(`Deposited ${j} x${it.count}`);
        } catch (e) {}
      }
    }

    // Deposit extra stone swords (keep iron sword)
    const stoneSwords = bot.inventory.items().filter(i => i.name === 'stone_sword');
    for (const ss of stoneSwords) {
      try {
        await chest.deposit(ss.type, null, ss.count);
        console.log(`Deposited stone_sword x${ss.count}`);
      } catch (e) {}
    }

    // Deposit stone pickaxe if iron pickaxe present
    if (lib.count('iron_pickaxe') > 0) {
      const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
      if (sp) {
        try {
          await chest.deposit(sp.type, null, sp.count);
          console.log(`Deposited stone_pickaxe x${sp.count}`);
        } catch (e) {}
      }
    }

    // Check chest contents
    const cItems = chest.containerItems();
    console.log('--- Current Base Chest Contents ---');
    for (const it of cItems) {
      console.log(`  ${it.name} x${it.count}`);
    }

    chest.close();
  } catch (err) {
    console.log('Chest access notice:', err.message);
  }
}

// 2. Wait for night (tick 12542) and sleep in bed
const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
if (bedBlock) {
  console.log(`Bed located at ${lib.fmt(bedBlock.position)}`);

  while (!checkCancelled()) {
    const t = bot.time.timeOfDay;
    const isNight = (t >= 12542 && t <= 23460);

    if (isNight) {
      console.log(`Night active (time ${t})! Sleeping in bed...`);
      try {
        await bot.sleep(bedBlock);
        bot.chat('delta: Sleeping in bed to skip night and reset HP/Food!');
        console.log('Sleeping! Waiting for dawn...');
        const sleepStart = Date.now();
        while (bot.isSleeping && Date.now() - sleepStart < 10000 && !checkCancelled()) {
          await sleep(500);
        }
        console.log('Woke up! Current time:', bot.time.timeOfDay);
        break;
      } catch (e) {
        console.log('Sleep notice:', e.message);
        await sleep(1000);
      }
    } else if (t < 12542) {
      const waitSec = Math.round((12542 - t) / 20);
      console.log(`Dusk: ${waitSec}s until night (12542)...`);
      if (waitSec > 10) await sleep(4000);
      else await sleep(1000);
    } else {
      // Past dawn
      break;
    }
  }
}

// 3. Equip armor and weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// 4. Log nearby teammates
console.log('\n--- Teammates in Base ---');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username)) {
  console.log(`- ${p.username} at ${lib.fmt(p.position)}, held: ${p.heldItem ? p.heldItem.name : 'null'}`);
}

console.log('Delta Final Inv:', JSON.stringify(lib.inv()));
bot.chat(`delta: Dawn arrived! HP: ${bot.health}/20, Food: ${bot.food}/20. Fully equipped for Stronghold march to (233, y, -98)!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay,
  inv: lib.inv()
};
