import SideNav from '@/app/ui/dashboard/sidenav';

interface Props {
  children: React.ReactNode;
}

// Activar Implementación de prerenderización previa parcial para la ruta de /dashboard.
// export const experimental_ppr = true;

export default function Layout({ children }: Props) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}  