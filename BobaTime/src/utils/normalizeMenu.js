/**
 * Normalize raw scraped menu data into the PRD schema
 * @param {object} rawData - Raw scraped data
 * @param {string} rawData.shop - Shop name
 * @param {string} rawData.url - Shop URL
 * @param {object} rawData.series - Series data with drinks
 * @param {object} rawData.toppings - Toppings data (optional)
 * @returns {object} - Normalized menu data matching PRD schema
 */
function normalizeMenu(rawData) {
  const { shop, url, series = {}, toppings = {} } = rawData;
  
  const normalized = {
    shop,
    url,
    scraped_at: new Date().toISOString(),
    series: {},
    toppings: {}
  };
  
  // Normalize series and drinks
  for (const [seriesName, seriesData] of Object.entries(series)) {
    normalized.series[seriesName] = {
      drinks: {}
    };
    
    const drinks = seriesData.drinks || seriesData;
    
    for (const [drinkName, drinkData] of Object.entries(drinks)) {
      normalized.series[seriesName].drinks[drinkName] = normalizeDrink(drinkData);
    }
  }
  
  // Normalize toppings
  for (const [toppingName, toppingData] of Object.entries(toppings)) {
    normalized.toppings[toppingName] = {
      price: toppingData.price || toppingData || 'unknown'
    };
  }
  
  return normalized;
}

/**
 * Normalize a single drink to the PRD schema
 * @param {object} drink - Raw drink data
 * @returns {object} - Normalized drink
 */
function normalizeDrink(drink) {
  // Handle case where drink is just a string (drink name only)
  if (typeof drink === 'string') {
    return {
      tea_base: inferTeaBase(drink, ''),
      description: '',
      base_price: 'unknown',
      has_price: false,
      upsizes: {},
      toppings_not_allowed: []
    };
  }
  
  const {
    tea_base,
    description = '',
    base_price = 'unknown',
    price,
    upsizes = {},
    toppings_not_allowed = []
  } = drink;
  
  // Use 'price' if 'base_price' not provided
  const finalPrice = base_price !== 'unknown' ? base_price : (price || 'unknown');
  const hasPrice = finalPrice !== 'unknown' && finalPrice !== null && finalPrice !== '';
  
  return {
    tea_base: tea_base || inferTeaBase(drink.name || '', description),
    description,
    base_price: hasPrice ? parseFloat(finalPrice) || 'unknown' : 'unknown',
    has_price: hasPrice,
    upsizes: normalizeUpsizes(upsizes),
    toppings_not_allowed: Array.isArray(toppings_not_allowed) ? toppings_not_allowed : []
  };
}

/**
 * Normalize upsizes to consistent format
 * @param {object|array} upsizes - Raw upsize data
 * @returns {object} - Normalized upsizes
 */
function normalizeUpsizes(upsizes) {
  if (!upsizes || Object.keys(upsizes).length === 0) {
    return {};
  }
  
  const normalized = {};
  
  if (Array.isArray(upsizes)) {
    // Convert array to object
    upsizes.forEach(upsize => {
      if (upsize.size && upsize.price !== undefined) {
        normalized[upsize.size] = parseFloat(upsize.price) || 0;
      }
    });
  } else {
    // Already an object, just ensure prices are numbers
    for (const [size, price] of Object.entries(upsizes)) {
      normalized[size] = parseFloat(price) || 0;
    }
  }
  
  return normalized;
}

/**
 * Infer tea base from drink name and description
 * @param {string} name - Drink name
 * @param {string} description - Drink description
 * @returns {string} - Inferred tea base
 */
function inferTeaBase(name = '', description = '') {
  const text = `${name} ${description}`.toLowerCase();
  
  if (text.includes('green tea') || text.includes('jasmine')) {
    return 'Green Tea';
  }
  if (text.includes('black tea') || text.includes('assam')) {
    return 'Black Tea';
  }
  if (text.includes('oolong')) {
    return 'Oolong Tea';
  }
  if (text.includes('milk tea')) {
    return 'Black Tea'; // Most milk teas use black tea
  }
  if (text.includes('fruit') || text.includes('lemon') || text.includes('peach')) {
    return 'Fruit Tea';
  }
  if (text.includes('matcha')) {
    return 'Matcha';
  }
  
  return 'Unknown';
}

module.exports = {
  normalizeMenu,
  normalizeDrink,
  normalizeUpsizes,
  inferTeaBase
};
