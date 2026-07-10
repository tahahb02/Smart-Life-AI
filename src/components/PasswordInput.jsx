import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ value, onChange, placeholder, label, id, error }) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} required placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800/50 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-sm
            ${error ? 'border-red-400 dark:border-red-500/50' : 'border-gray-200 dark:border-gray-700/50'}`} />
        <button type="button" onClick={() => setShow(!show)} tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default PasswordInput;
