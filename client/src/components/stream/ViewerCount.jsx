import { IoEye } from 'react-icons/io5';
import { formatNumber } from '../../utils/formatNumber.js';

const ViewerCount = ({ count }) => (
  <span className="inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-sm font-medium">
    <IoEye size={16} /> {formatNumber(count)} watching
  </span>
);

export default ViewerCount;
