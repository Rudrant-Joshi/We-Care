import { useState, useEffect, useCallback } from 'react';
import type { StoredAppointment } from '../models/appointmentModel';
import { BookingController } from '../controllers/bookingController';
import { useAuth } from '../context/AuthContext';

export function useAppointments() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      if (currentUser?.email) {
        const data = BookingController.getAppointmentsForUser(currentUser.email);
        setAppointments(data);
      } else {
        const data = BookingController.getAllAppointments();
        setAppointments(data);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, loading, refresh: fetchAppointments };
}

export default useAppointments;
