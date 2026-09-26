// Owner: Prashasti (Prashasti09) - frontend UI
// Search box that waits until you stop typing (300 ms) before searching.
import { useEffect, useState } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Search' }) {
  const [value, setValue] = useState('');
  useEffect(() => {
    const t = setTimeout(() => onSearch(value.trim()), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <input
      type="search"
      className="search"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      aria-label={placeholder}
    />
  );
}
