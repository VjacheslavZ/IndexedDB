import Repository from './core.js';
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

class UserService {
  constructor(repository) {
    this.repository = repository;
  }

  async incrementAge(id) {
    const user = await this.repository.get({ store: 'user', id });
    if (!user) throw new Error('User with id=1 not found');
    user.age += 1;
    await this.repository.update({ store: 'user', record: user });
    await this.repository.create({
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

  async addUser(name, age) {
    const { result } = await this.repository.create({
      store: 'user',
      record: { name, age },
    });
    this.repository.create({
      store: 'userLogs',
      record: {
        action: 'add_user',
        user_id: result,
        previous_value: -1,
        new_value: age,
      },
    });

    return result;
  }

  selectAllUsers = async () => {
    try {
      const allUsers = await this.repository.select({
        store: 'user',
        indexName: 'age',
        where: ['≥', 18],
        offset: 0,
        limit: 4,
        direction: 'prev',
      });
      console.log('allUsers', allUsers);
    } catch (error) {
      console.log('error', error);
    }
  };

  deleteUser = async id => {
    if (!id) return;
    await this.repository.delete({ store: 'user', id });
  };
}
// Usage:
const db = await new Database('balanced', { version: 1, schemas });
const userRepository = new Repository(db, schemas);
const userService = await new UserService(userRepository);

export default userService;
//   over both opfs_and_indexedDB_storage_agnostic_layer
