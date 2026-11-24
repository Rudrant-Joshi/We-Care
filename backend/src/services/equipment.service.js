/**
 * Backend Equipment Service
 */

import { Equipment, inMemoryEquipment } from '../models/equipment.model.js';

export class EquipmentService {
  static async getAll(filter = {}) {
    let list = [...inMemoryEquipment];

    if (filter.category) {
      list = list.filter(e => e.category.toLowerCase().includes(filter.category.toLowerCase()));
    }
    if (filter.departmentId) {
      list = list.filter(e => e.departmentId === filter.departmentId);
    }
    if (filter.status) {
      list = list.filter(e => e.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(e => 
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.departmentName.toLowerCase().includes(q)
      );
    }

    return list;
  }

  static async getById(id) {
    return inMemoryEquipment.find(e => e.id === id) || null;
  }

  static async create(payload) {
    const item = new Equipment(payload);
    inMemoryEquipment.push(item);
    return item;
  }

  static async update(id, updates) {
    const index = inMemoryEquipment.findIndex(e => e.id === id);
    if (index === -1) return null;
    inMemoryEquipment[index] = {
      ...inMemoryEquipment[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return inMemoryEquipment[index];
  }

  static async delete(id) {
    const index = inMemoryEquipment.findIndex(e => e.id === id);
    if (index === -1) return false;
    inMemoryEquipment.splice(index, 1);
    return true;
  }
}

export default EquipmentService;
