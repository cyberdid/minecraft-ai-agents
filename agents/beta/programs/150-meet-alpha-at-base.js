console.log('Heading back to base to meet alpha...')
bot.chat('beta: Great job on the 6 raw iron alpha! Meeting you back at the base.')

await lib.goTo(294, 72, -54, 2)
console.log('Arrived near base entrance:', bot.entity.position)

// Enter base through door
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {
  console.log('Door passage note:', e.message)
}

console.log('Inside base at:', bot.entity.position)
bot.chat('beta: Back inside base with you alpha!')

// Inspect chest to see current contents
const contents = await lib.chestContents()
console.log('Chest contents:', JSON.stringify(contents, null, 2))
return { pos: bot.entity.position, chest: contents }
