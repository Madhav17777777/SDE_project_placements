import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../constants/routes.js';

const AuthLayout = () => (
  <div className="flex min-h-screen items-center justify-center px-4 py-12">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card w-full max-w-md p-8"
    >
      <Link to={ROUTES.HOME} className="mb-6 block text-center text-2xl font-bold">
        <span className="bg-gradient-to-br from-accent-400 to-accent-700 bg-clip-text text-transparent">
          StreamVerse
        </span>
      </Link>
      <Outlet />
    </motion.div>
  </div>
);

export default AuthLayout;
