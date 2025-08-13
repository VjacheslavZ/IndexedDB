class SchemaValidate {
  #schemas;

  constructor(schemas) {
    this.#schemas = schemas;
  }

  validate({ store, record }) {
    const schema = this.#schemas[store];
    if (!schema) throw new Error(`Schema for ${store} is not defined`);
    for (const [key, val] of Object.entries(record)) {
      const field = schema[key];
      const name = `Field ${store}.${key}`;
      if (!field) throw new Error(`${name} is not defined`);
      if (field.type === 'int') {
        if (Number.isInteger(val)) continue;
        throw new Error(`${name} expected to be integer`);
      } else if (field.type === 'str') {
        if (typeof val === 'string') continue;
        throw new Error(`${name} expected to be string`);
      }
    }
  }
}

export default SchemaValidate;
