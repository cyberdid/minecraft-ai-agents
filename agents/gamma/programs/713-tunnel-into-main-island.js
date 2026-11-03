// programs/713-tunnel-into-main-island.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 713: TUNNEL WEST INTO MAIN END ISLAND ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Warn team in chat
bot.chat('team: DO NOT WALK EAST (x>102 is void)! Main Island is WEST at x<=97! Tunneling West into island!');

// Equip pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Survey tunnel line from x=98 down to x=85 along z=0, y=49..51
for (let x = 98; x >= 85; x--) {
  const f = bot.blockAt(new Vec3(x, 48, 0))?.name;
  const feet = bot.blockAt(new Vec3(x, 49, 0))?.name;
  const head = bot.blockAt(new Vec3(x, 50, 0))?.name;
  const roof = bot.blockAt(new Vec3(x, 51, 0))?.name;
  console.log(`x=${x}, z=0: y48=${f}, y49=${feet}, y50=${head}, y51=${roof}`);
}

// Tunnel 5 blocks West into the End Stone safely
for (let targetX = 98; targetX >= 92 && !isCancelled(); targetX--) {
  console.log(`Advancing tunnel to x=${targetX}...`);
  // Dig head and feet blocks at targetX, z=0
  for (const y of [50, 49]) {
    const b = bot.blockAt(new Vec3(targetX, y, 0));
    if (b && b.boundingBox === 'block') {
      console.log(`Mining ${b.name} at (${targetX}, ${y}, 0)...`);
      await bot.dig(b);
    }
  }

  // Ensure solid floor underfoot
  const floor = bot.blockAt(new Vec3(targetX, 48, 0));
  if (!floor || floor.boundingBox !== 'block') {
    const cob = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'end_stone');
    if (cob) {
      await bot.equip(cob, 'hand');
      const ref = bot.blockAt(new Vec3(targetX + 1, 48, 0));
      if (ref) {
        try { await bot.placeBlock(ref, new Vec3(-1, 0, 0)); } catch (e) {}
      }
    }
  }

  // Step forward
  await bot.lookAt(new Vec3(targetX + 0.5, 49.0, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(400);
  bot.clearControlStates();
}

console.log('Tunnel position now:', lib.fmt(bot.entity.position));

// Equip shield in offhand and sword in mainhand
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
