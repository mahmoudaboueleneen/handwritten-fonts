import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-full">
      <Sidebar />

      <div className="container mx-auto">{children}</div>
    </div>
  );
};

export default Layout;
