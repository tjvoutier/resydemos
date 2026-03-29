import { AppProvider } from '@/context/AppContext';
import PhoneChrome from '@/components/PhoneChrome';

export default function Home() {
  return (
    <AppProvider>
      <PhoneChrome />
    </AppProvider>
  );
}
