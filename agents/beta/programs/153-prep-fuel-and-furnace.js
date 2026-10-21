console.log('Crafting planks from oak_log and birch_log...')
if (lib.count('oak_log') > 0) {
  await lib.craft('oak_planks', 16)
}
if (lib.count('birch_log') > 0) {
  await lib.craft('birch_planks', 4)
}

console.log('Depositing 16 planks into chest for fuel...')
await lib.deposit({ oak_planks: 16 })

bot.chat('alpha: 16 oak planks deposited in base chest for furnace fuel! Door is clear for you.')

console.log('Inventory:', JSON.stringify(lib.inv()))
const contents = await lib.chestContents()
console.log('Base chest now:', JSON.stringify(contents, null, 2))
return lib.inv()
