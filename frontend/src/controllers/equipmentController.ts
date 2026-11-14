/**
 * Equipment Controller
 * 
 * Manages equipment catalog filtering, search parameters, availability verification,
 * and reservation workflows.
 */

import { equipmentService } from '../services/equipmentService';
import type { Equipment, EquipmentFilter } from '../models/equipmentModel';

export class EquipmentController {
  static async getCatalog(filter?: EquipmentFilter): Promise<Equipment[]> {
    return await equipmentService.fetchEquipment(filter);
  }

  static getDetails(id: string): Equipment | null {
    return equipmentService.getEquipmentById(id);
  }

  static filterByCategory(equipment: Equipment[], category: string): Equipment[] {
    if (!category || category === 'all') return equipment;
    return equipment.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  static searchEquipment(equipment: Equipment[], term: string): Equipment[] {
    if (!term || !term.trim()) return equipment;
    const q = term.toLowerCase().trim();
    return equipment.filter(e => 
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.departmentName.toLowerCase().includes(q) ||
      (e.manufacturer && e.manufacturer.toLowerCase().includes(q))
    );
  }

  static async submitReservation(
    id: string,
    reservationDetails: { date: string; reservedBy: string; durationDays: number }
  ): Promise<{ success: boolean; message: string }> {
    const success = await equipmentService.reserveEquipment(id, reservationDetails);
    if (success) {
      return { success: true, message: 'Equipment reserved successfully.' };
    }
    return { success: false, message: 'Unable to reserve equipment. Please try again.' };
  }
}

export default EquipmentController;
