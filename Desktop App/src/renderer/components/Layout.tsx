import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex">
      <div className="self-center">
        <Sidebar />
      </div>

      <div className="container mx-auto">{children}</div>
    </div>
  );
};

export default Layout;
