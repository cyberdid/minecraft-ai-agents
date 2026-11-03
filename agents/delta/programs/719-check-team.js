console.log('=== PROGRAM 719: CHECK TEAM POSITIONS ===');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`- ${p.username}: pos=${lib.fmt(p.position)}, dim=${bot.game.dimension}, held=${p.heldItem ? p.heldItem.name : 'null'}`);
}

bot.chat('gamma: Stand motionless inside (46.5, 66.0, 2.0) with clearControlStates() for 4s to warp to base!');
