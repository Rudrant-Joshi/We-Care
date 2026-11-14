import { useState, useEffect } from 'react';
import type { Equipment, EquipmentFilter } from '../models/equipmentModel';
import { EquipmentController } from '../controllers/equipmentController';

export function useEquipment(initialFilter?: EquipmentFilter) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EquipmentFilter | undefined>(initialFilter);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    EquipmentController.getCatalog(filter)
      .then(data => {
        if (isMounted) {
          setEquipment(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching equipment:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filter]);

  return { equipment, loading, setFilter };
}

export default useEquipment;
