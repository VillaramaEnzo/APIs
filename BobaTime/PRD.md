
```json
{
  "shop": "GongCha",
  "url": "https://gongcha.co.nz/menu",
  "scraped_at": "2025-12-01T14:00:00Z",

  "series": {
    "Brewed Tea": {
      "drinks": {
        "Green Tea": {
          "tea_base": "Green Tea",
          "description": "Classic brewed green tea",
          "base_price": 4.50,
          "upsizes": {"Large": 1.50},
          "toppings_not_allowed": []
        },
        "Lemon Black Tea": {
          "tea_base": "Black Tea",
          "description": "Refreshing black tea with lemon",
          "base_price": 5.00,
          "upsizes": {"Large": 1.50},
          "toppings_not_allowed": ["Pudding"]
        }
      }
    },
    "Milk Tea": {
      "drinks": {
        "Classic Milk Tea": {
          "tea_base": "Black Tea",
          "description": "Black tea with milk and sugar",
          "base_price": 5.00,
          "upsizes": {"Large": 1.50},
          "toppings_not_allowed": []
        }
      }
    },
    "Seasonal Specials": {
      "drinks": {
        "Pumpkin Spice Milk Tea": {
          "tea_base": "Black Tea",
          "description": "Limited-time seasonal flavor",
          "base_price": 5.50,
          "upsizes": {"Large": 1.50},
          "toppings_not_allowed": []
        }
      }
    }
  },

  "toppings": {
    "Pearls": {"price": 0.50},
    "Pudding": {"price": 0.70},
    "Jelly": {"price": 0.70},
    "Aloe Vera": {"price": 0.80},
    "Coconut Jelly": {"price": 0.80},
    ...
  }
}

```