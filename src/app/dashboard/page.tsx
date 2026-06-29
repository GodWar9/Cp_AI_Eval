import { redirect } from 'next/navigation';

// For simplicity, dashboard just redirects to the tracker where the main view is
export default function Dashboard() {
  redirect('/cp-tracker');
}
