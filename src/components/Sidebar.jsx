import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import {
  LayoutDashboard, Wallet, CheckSquare, Calendar, Pill,
  MessageCircle, User, Sun, Moon, ChevronLeft, ChevronRight,
  LogOut, PanelLeftClose, PanelLeftOpen, Menu, X, Award
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/budget', label: 'Budget', icon: Wallet },
  { path: '/tasks', label: 'Tâches', icon: CheckSquare },
  { path: '/appointments', label: 'Rendez-vous', icon: Calendar },
  { path: '/medicines', label: 'Médicaments', icon: Pill },
  { path: '/chat', label: 'Assistant IA', icon: MessageCircle },
  { path: '/profile', label: 'Profil', icon: User },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed, toggle } = useSidebar();
  const [mobileOpen, setMobileOpen] = [false, () => {}];
  const isOpen = !collapsed;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className={`flex items-center ${isOpen || isMobile ? 'px-5' : 'px-3 justify-center'} h-16 border-b border-gray-100 dark:border-gray-800 flex-shrink-0`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        {(isOpen || isMobile) && (
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">SmartLife</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">AI Assistant</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <div className={`flex items-center gap-3 rounded-xl text-sm transition-all duration-150 group
                ${isOpen || isMobile ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}
                ${active
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}>
                <Icon size={20} strokeWidth={active ? 2 : 1.5}
                  className={`flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                {(isOpen || isMobile) && <span className="whitespace-nowrap">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-2 space-y-1 flex-shrink-0">
        {/* Collapse toggle - desktop only */}
        {!isMobile && (
          <button onClick={toggle}
            className={`w-full flex items-center gap-3 rounded-xl text-sm text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-all py-2.5 ${isOpen ? 'px-3' : 'justify-center'}`}>
            {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            {isOpen && <span>Réduire</span>}
          </button>
        )}

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className={`w-full flex items-center gap-3 rounded-xl text-sm text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-all py-2.5 ${isOpen || isMobile ? 'px-3' : 'justify-center'}`}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {(isOpen || isMobile) && <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>}
        </button>

        {/* User info */}
        <div className={`flex items-center gap-3 py-2.5 ${isOpen || isMobile ? 'px-3' : 'justify-center'}`}>
          <button onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-blue-500/30 transition-all">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0] || '?'
            )}
          </button>
          {(isOpen || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white truncate font-medium">{user?.name}</p>
              <div className="flex items-center gap-1">
                <Award size={11} className="text-amber-500" />
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{user?.loyaltyPoints || 0} pts</p>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        {(isOpen || isMobile) && (
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all">
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden fixed left-0 top-0 h-full w-[260px] z-50 shadow-2xl">
            <SidebarContent isMobile />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside animate={{ width: isOpen ? 256 : 72 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:block fixed left-0 top-0 h-full z-50 flex-shrink-0">
        <SidebarContent />
      </motion.aside>
    </>
  );
};

export default Sidebar;
