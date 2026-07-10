import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
};

const MainContent = () => {
  const location = useLocation();
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Sidebar />
      <main className={`transition-all duration-250 ease-in-out lg:ml-[256px] ${collapsed ? 'lg:!ml-[72px]' : ''}`}>
        <div className="p-4 lg:p-6 pt-16 lg:pt-6 max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const MainLayout = () => (
  <SidebarProvider>
    <MainContent />
  </SidebarProvider>
);

export default MainLayout;
