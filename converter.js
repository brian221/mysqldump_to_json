const _fs = require('fs')

const numbers = ['int', 'decimal', 'smallint', 'mediumint', 'bigint']
const strings = ['varchar', 'text', 'date', 'timestamp', 'longtext']
const booleans = ['tinyint']

const Converter = (() => {
  const readFile = async (fileName) => {
    const fileAsString = await _fs.readFileSync(fileName, 'utf8')
    return fileAsString.split('\n')
  }

  const startsWith = function (str, textToFind) {
    return str.trim().indexOf(textToFind.trim()) === 0
  }

  const convertData = function (data, type) {
    if (type.indexOf('(') > -1) {
      type = type.substring(0, type.indexOf('('))
    }

    switch (true) {
      case strings.includes(type):
        return data
      case numbers.includes(type):
        return Number(data)
      case booleans.includes(type):
         return data == 1 // eslint-disable-line
      default:
        console.log('Don\'t know this type: ' + type)
        return data
    }
  }

  const populateTableDefs = async (fileLines) => {
    const _collections = {}
    let line = 0
    while (line < fileLines.length) {
      let currentLine = fileLines[line].trim()

      if (startsWith(currentLine, 'CREATE TABLE')) {
        const tableName = currentLine.split('`')[1]

        line++
        currentLine = fileLines[line].trim()
        const fields = []

        while (startsWith(currentLine, '`')) {
          const parts = currentLine.split('`')
          const fieldName = parts[1]
          let fieldType = parts[2].split(' ')[1]

          if (fieldName === 'id') {
            fieldType = 'text'
          }

          fields.push({
            name: fieldName,
            type: fieldType
          })

          line++
          currentLine = fileLines[line].trim()
        }

        _collections[tableName] = {
          name: tableName,
          fields: fields
        }
      }
      line++
    }
    return _collections
  }

  const readTableValues = async (currentCollection, fileLines) => {
    const { fields } = currentCollection

    const insertKey = 'INSERT INTO `' + currentCollection.name + '` VALUES '
    let line = 0
    while (line < fileLines.length) {
      let currentLine = fileLines[line]

      if (startsWith(currentLine, insertKey)) {
        currentLine = currentLine.replace(insertKey, '')
        let index = 1
        let valueId = 0
        let insideString = false
        let currentValue = ''
        const values = []
        let pair = {}

        while (index < currentLine.length) {
          const previousChar = currentLine.charAt(index - 1)
          const currentChar = currentLine.charAt(index)

          if ((currentChar === ',' || currentChar === ')') && !insideString) {
            const field = fields[valueId]
            if (field !== undefined) {
              pair[field.name] = convertData(currentValue, field.type)
            }

            valueId++
            currentValue = ''

            if (currentChar === ')') {
              index += 2
              values.push(pair)
              pair = {}
              valueId = 0
            }
          } else if (currentChar === "'" && previousChar !== '\\') {
            insideString = !insideString
          } else {
            currentValue = currentValue + currentChar
          }

          index++
        }

        return values
      }
      line++
    }
  }

  return {
    getData: async (fileName) => {
      const fileLines = await readFile(fileName)
      const collections = await populateTableDefs(fileLines)

      // then populate each collection
      for (const tableName in collections) {
        // optional check for properties from prototype chain
        if (collections.hasOwnProperty(tableName)) { // eslint-disable-line
          const collection = collections[tableName]
          collections[tableName].values = await readTableValues(collection, fileLines)
        }
      }

      return collections
    }
  }
})()

module.exports = Converter
