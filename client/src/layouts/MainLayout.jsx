import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import Footer from '../components/layout/Footer.jsx';

const MainLayout = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="flex">
      <Sidebar />
      <motion.main
        key={window.location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-6 md:px-8"
      >
        <Outlet />
      </motion.main>
    </div>
    <Footer />
  </div>
);

export default MainLayout;
