// Find all remaining obsidian blocks within 16 blocks
const b = bot
const obs = b.findBlocks({
  matching: bl => bl && bl.name === 'obsidian',
  maxDistance: 16,
  count: 20
})
console.log('Remaining obsidian blocks:', obs.length)
for (const p of obs) {
  console.log('  Obsidian at:', p, 'under:', b.blockAt(p.offset(0, -1, 0))?.name)
}
return { remainingObsidian: obs.length }
