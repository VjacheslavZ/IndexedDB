const rangeStrategies = {
  '≥': v => IDBKeyRange.lowerBound(v, false),
  '>': v => IDBKeyRange.lowerBound(v, true),
  '≤': v => IDBKeyRange.upperBound(v, false),
  '<': v => IDBKeyRange.upperBound(v, true),
  '=': v => IDBKeyRange.only(v),
  only: v => IDBKeyRange.only(v),
  between: (low, high) => {
    if (low === undefined || high === undefined)
      throw new Error("'between' needs 2 arguments");
    return IDBKeyRange.bound(low, high, false, false);
  },
  bound: (low, high, lowerOpen, upperOpen) => {
    if (low === undefined || high === undefined)
      throw new Error("'bound' needs 4 arguments");
    return IDBKeyRange.bound(low, high, Boolean(lowerOpen), Boolean(upperOpen));
  },
};

export const getRange = ([type, ...args]) => {
  try {
    const strategy = rangeStrategies[type];
    if (!strategy) throw new Error(`Unknown range type: ${type}`);
    return strategy(...args);
  } catch (err) {
    console.error(`Error creating range (${type}):`, err.message);
    return null;
  }
};
