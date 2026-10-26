// programs/429-rearm-and-rejoin-nether.js
console.log('=== Step: Re-arm from base chest & rejoin team in Nether bunker ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Inspect base chest (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Base chest items:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    
    // Withdraw cobblestone
    const cobbles = items.filter(i => i.name === 'cobblestone' || i.name === 'cobbled_deepslate');
    for (const c of cobbles) {
      if (lib.count('cobblestone') >= 64) break;
      const take = Math.min(c.count, 64 - lib.count('cobblestone'));
      await chest.withdraw(c.type, null, take);
      console.log(`Withdrew ${take} ${c.name}`);
    }

    // Withdraw food
    const foods = items.filter(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple', 'egg'].includes(i.name));
    for (const fd of foods) {
      await chest.withdraw(fd.type, null, Math.min(fd.count, 4));
      console.log(`Withdrew ${fd.name}x${Math.min(fd.count, 4)}`);
      break;
    }

    // Withdraw iron ingots if any
    const ingots = items.find(i => i.name === 'iron_ingot');
    if (ingots) {
      await chest.withdraw(ingots.type, null, ingots.count);
      console.log(`Withdrew ${ingots.count} iron_ingot`);
    }

    // Withdraw wood/planks/sticks
    const wood = items.find(i => i.name.endsWith('_planks') || i.name.endsWith('_log') || i.name === 'stick');
    if (wood) {
      await chest.withdraw(wood.type, null, Math.min(wood.count, 8));
      console.log(`Withdrew ${wood.name}`);
    }

    // Withdraw weapons/armor if any
    const sword = items.find(i => i.name.endsWith('_sword'));
    if (sword) await chest.withdraw(sword.type, null, 1);
    const pick = items.find(i => i.name.endsWith('_pickaxe'));
    if (pick) await chest.withdraw(pick.type, null, 1);
    const shield = items.find(i => i.name === 'shield');
    if (shield) await chest.withdraw(shield.type, null, 1);

    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 2. Check base furnaces F1 and F2 for smelted iron
for (const [name, pos] of [['F1', [295, 72, -55]], ['F2', [295, 72, -57]]]) {
  const fb = bot.blockAt(new Vec3(...pos));
  if (fb) {
    try {
      const f = await bot.openFurnace(fb);
      const out = f.outputItem();
      if (out && out.count > 0) {
        await f.takeOutput();
        console.log(`Took ${out.count} ${out.name} from ${name}`);
      }
      f.close();
    } catch (e) {}
  }
}

// 3. Craft basic stone sword & stone pickaxe at crafting table (295, 72, -56) if needed
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (tableBlock && lib.count('cobblestone') >= 6) {
  // If we have planks or sticks, craft tools
  if (lib.count('stick') < 4 && lib.count('birch_planks') > 0) {
    const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
    if (sr) await bot.craft(sr, 1, null);
  }
  if (lib.count('stick') >= 2) {
    const pr = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tableBlock)[0];
    if (pr) await bot.craft(pr, 1, tableBlock);
    const swr = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tableBlock)[0];
    if (swr) await bot.craft(swr, 1, tableBlock);
    console.log('Crafted stone pickaxe & sword!');
  }
}

// 4. Equip armor if any
await lib.equipArmor();

console.log('Beta re-armed inventory:', JSON.stringify(lib.inv()));

// 5. Step through base door (294, 72, -54) and enter Nether portal (299, 73, -54)
try {
  await lib.goThroughDoor(294, 72, -54, { close: false });
  console.log('Outside base! Navigating to Nether portal...');
  await lib.goTo(299, 73, -54, 0.5);
  console.log('Inside portal frame! Waiting for Nether transition...');
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
      console.log('Re-entered the Nether! Pos:', lib.fmt(bot.entity.position));
      break;
    }
  }
} catch (e) {
  console.log('Nether re-entry error:', e.message);
}

bot.chat(`beta: Re-armed at base and rejoined team at Nether bunker ${lib.fmt(bot.entity.position)}! Dimension: ${bot.game.dimension}.`);
