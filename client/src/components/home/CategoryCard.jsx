import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryCard = ({ category }) => (
  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
    <Link to={`/browse?category=${category.slug}`} className="group block">
      <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-surface-700 to-surface-900 border border-white/10">
        {category.thumbnail ? (
          <img src={category.thumbnail} alt={category.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white/10">
            {category.name?.slice(0, 1)}
          </div>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-medium group-hover:text-accent-glow">{category.name}</p>
    </Link>
  </motion.div>
);

export default CategoryCard;
