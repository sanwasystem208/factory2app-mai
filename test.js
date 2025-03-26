const json=[ {
    "users": [
      {
        "name": "John",
        "age": 30
      },
      {
        "name": "Jane",
        "age": 25
      }
    ]
  }, {
    "users": [
      {
        "name": "John",
        "age": 30
      },
      {
        "name": "Jane",
        "age": 25
      }
    ]
  }]

  const tagList = json.flatMap(data => data.users);
  
  console.log(tagList);
  // => [
  //   {
  //     "name": "John",
  //     "age": 30
  //   },
  //   {
  //     "name": "Jane",
  //     "age": 25
  //   }
  // ]node test.js
