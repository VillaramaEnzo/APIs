
### Data Structure

```json
{
  "countries": {
    "<country_code_or_name>": {
      "stores": [
        {
          "name": "...",
          "url": "...",
          "notes": "... (optional)",
          "status": "active"  // optional: active/closed/unknown
        },
        ...
      ]
    },
    ...
  }
}

```

```json
{
  "countries": {
    "NZ": {
      "stores": [
        {
          "name": "Gong Cha",
          "url": "https://gongcha.co.nz",
          "notes": "National chain — multiple outlets in Auckland"
        },
        {
          "name": "WUCHA",
          "url": "https://wucha.co.nz",
          "notes": "NZ-based bubble tea brand with Auckland stores" 
        },
        {
          "name": "HuluCat",
          "url": "https://hulucat.co.nz", 
          "notes": "(Western/Auckland area) bubble tea store"
        },
        {
          "name": "Chatime",
          "url": "https://www.chatime.co.nz", 
          "notes": "International chain with Auckland presence"
        },
        {
          "name": "Yi Fang Taiwan Fruit Tea",
          "url": "https://yifangtea.co.nz", 
          "notes": "Fruit-tea style bubble tea, has NZ site"
        },
        {
          "name": "Machi Machi",
          "url": "https://www.machimachi.co.nz", 
          "notes": "Bubble tea brand reportedly operating in Auckland"
        }
      ]
    }
  }
}
```