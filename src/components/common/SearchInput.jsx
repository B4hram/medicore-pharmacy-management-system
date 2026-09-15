
import { Search, X } from 'lucide-react';

function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search...',
}) {
  const handleClear = () => {
    if (onChange) {
      onChange({
        target: {
          value: '',
        },
      });
    }
  };

  return (
    <div className="table-search">
      <Search size={17} />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

      {value && (
        <button
          type="button"
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default SearchInput;

