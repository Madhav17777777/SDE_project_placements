import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../constants/routes.js';
import Button from '../components/common/Button.jsx';

const NotFound = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex min-h-[60vh] flex-col items-center justify-center text-center"
  >
    <h1 className="bg-gradient-to-br from-accent-400 to-accent-700 bg-clip-text text-7xl font-bold text-transparent">
      404
    </h1>
    <p className="mt-3 text-white/60">This channel seems to have gone offline for good.</p>
    <Link to={ROUTES.HOME} className="mt-6">
      <Button variant="primary">Back to Home</Button>
    </Link>
  </motion.div>
);

export default NotFound;
