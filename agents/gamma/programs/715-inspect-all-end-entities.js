// programs/715-inspect-all-end-entities.js
console.log('=== ALL ENTITIES IN THE END ===');
console.log('Gamma at:', lib.fmt(bot.entity.position));

bot.chat('alpha: gamma is on Main End Island at (26, 57, 0) with netherite_sword! Dragon at (46, 71, 11)!');

const entityCounts = {};
for (const e of Object.values(bot.entities)) {
  if (!e) continue;
  entityCounts[e.name] = (entityCounts[e.name] || 0) + 1;
  if (e.name === 'ender_dragon' || e.name === 'end_crystal' || e.name.includes('crystal') || e.name === 'player') {
    const dist = bot.entity.position.distanceTo(e.position);
    console.log(`Entity: ${e.name} (id=${e.id}, username=${e.username || ''}) at ${lib.fmt(e.position)}, dist=${dist.toFixed(1)}m`);
  }
}

console.log('Entity counts:', JSON.stringify(entityCounts));
return { entityCounts };
