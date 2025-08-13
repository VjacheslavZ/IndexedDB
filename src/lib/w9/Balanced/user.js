import { Database } from './storage.js';

const schemas = {
  user: {
    id: { type: 'int', primary: true },
    name: { type: 'str' },
    age: { type: 'int', index: true },
  },
  userLogs: {
    id: { type: 'int', primary: true },
    action: { type: 'str' },
    user_id: { type: 'int', index: true },
    previous_value: { type: 'int' },
    new_value: { type: 'int' },
  },
};

class UserService extends Database {
  constructor(name, { version = 1, schemas = {} } = {}) {
    super(name, { version, schemas });
  }

  async incrementAge(id) {
    const user = await this.get({ store: 'user', id });
    if (!user) throw new Error('User with id=1 not found');
    user.age += 1;
    await this.update({ store: 'user', record: user });
    await this.insert({
      store: 'userLogs',
      record: {
        action: 'increment_user_age',
        user_id: id,
        previous_value: user.age,
        new_value: user.age + 1,
      },
    });

    return user;
  }
  /**
   * Others methods here
   */
}
// Usage:
const userService = await new UserService('test', { version: 1, schemas });
// userService.insert({ store: 'user', record: { name: 'John', age: 20 } })
// userService.incrementAge(1)
export default userService;
// alternative usage:
// const db = await new Database('test', { version: 1, schemas });
// await db.insert({ store: 'user', record: { name: 'John', age: 20 } })
