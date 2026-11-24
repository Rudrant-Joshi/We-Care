/**
 * Equipment Service
 * 
 * Provides API queries and caching for clinical equipment, surgical suites,
 * and diagnostic apparatus.
 */

import type { Equipment, EquipmentFilter } from '../models/equipment.model';
import { INITIAL_EQUIPMENT_CATALOG } from '../models/equipment.model';
import api from './api.service';

const STORAGE_KEY = 'wecare_equipment_catalog_v1';

export const equipmentService = {
  getAllEquipment(): Equipment[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return INITIAL_EQUIPMENT_CATALOG;
  },

  async fetchEquipment(filter?: EquipmentFilter): Promise<Equipment[]> {
    // Try remote API if available
    try {
      const response = await api.get<Equipment[]>('/equipment', filter);
      if (response.success && response.data && response.data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
        return response.data;
      }
    } catch {
      // Fallback to local
    }

    let items = this.getAllEquipment();

    if (filter) {
      if (filter.category) {
        items = items.filter(i => i.category.toLowerCase().includes(filter.category!.toLowerCase()));
      }
      if (filter.departmentId) {
        items = items.filter(i => i.departmentId === filter.departmentId);
      }
      if (filter.status) {
        items = items.filter(i => i.status === filter.status);
      }
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        items = items.filter(i => 
          i.name.toLowerCase().includes(q) || 
          i.description.toLowerCase().includes(q) ||
          i.departmentName.toLowerCase().includes(q)
        );
      }
      if (filter.minRate !== undefined) {
        items = items.filter(i => i.dailyRate >= filter.minRate!);
      }
      if (filter.maxRate !== undefined) {
        items = items.filter(i => i.dailyRate <= filter.maxRate!);
      }
    }

    return items;
  },

  getEquipmentById(id: string): Equipment | null {
    const list = this.getAllEquipment();
    return list.find(item => item.id === id) || null;
  },

  async reserveEquipment(id: string, reservationDetails: { date: string; reservedBy: string; durationDays: number }): Promise<boolean> {
    const list = this.getAllEquipment();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return false;

    list[index] = {
      ...list[index],
      status: 'reserved'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  }
};

export default equipmentService;
