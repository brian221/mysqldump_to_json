const converter = require('../converter')

const fileName = 'mydatadump.sql'

const init = async () => {
  const data = await converter.getData(fileName)
  console.log(JSON.stringify(data, null, 2))
}

init()
