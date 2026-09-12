/**
 * Appointment Section Component
 * 
 * Modular section wrapper for the WeCare appointment booking flow.
 * Can be embedded anywhere in the application or displayed on its dedicated page.
 */

import { AppointmentBento } from './AppointmentBento';

export interface AppointmentSectionProps {
  className?: string;
}

export default function AppointmentSection({ className = '' }: AppointmentSectionProps) {
  return (
    <div className={`w-full ${className}`}>
      <AppointmentBento />
    </div>
  );
}

export { AppointmentSection };
