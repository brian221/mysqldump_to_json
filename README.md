# Overview

This node.js module allows the conversion of a mysqldump file to JS Objects, which is
useful for importing data into any other datasource using your own migration process. 

This package has been tested on mysqldump 10.x from mysql version 5.5.

## Ouput

npm2js returns an object, containing your table data keyed on table name.  Each table entry
has the following properties: 
    - name: the name of the converted table
    - fields: an array of field definitions
    - values: an array of the values from the table

Sample output:

```
{
  "migrations": {
    "name": "migrations",
    "fields": [
      {
        "name": "migration",
        "type": "varchar(255)"
      },
      {
        "name": "batch",
        "type": "int(11)"
      }
    ],
    "values": [
      {
        "migration": "2014_10_12_000000_create_users_table",
        "batch": 1
      },
      {
        "migration": "2014_10_12_100000_create_password_resets_table",
        "batch": 1
      }
    ]
  }
}
```


## Usage

Install dump2js in your project.  Await dump2js.getData, providing a filename and relative
path to your mysqldump.sql file.

`npm install dump2js`

```
    const dump2js = require('dump2js');
    const fileName = 'mydatadump.sql'

    const init = async () => {
      const data = await dump2js.getData(fileName)
      console.log(JSON.stringify(data, null, 2))
    }

    init()
```



