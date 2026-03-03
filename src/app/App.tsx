import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { router } from './routes';

const queryClient = new QueryClient({
 defaultOptions: {
 queries: {
 retry: 1,
 refetchOnWindowFocus: false,
 },
 },
});

export default function App() {
 return (
 <QueryClientProvider client={queryClient}>
 <RouterProvider router={router} />
 <Toaster
 position="top-right"
 richColors
 theme="light"
 toastOptions={{
 style: {
 borderRadius: '2px',
 border: '1px solid #1E293B',
 textTransform: 'uppercase',
 fontSize: '10px',
 letterSpacing: '0.05em',
 fontWeight: 'bold'
 }
 }}
 />
 </QueryClientProvider>
 );
}
