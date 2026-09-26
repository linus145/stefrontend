'use client';

import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { ChevronDown, Search, Check, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  dialCode: string; // e.g. +91
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'Israel', code: 'IL', dialCode: '+972', flag: '🇮🇱' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852', flag: '🇭🇰' },
  { name: 'Taiwan', code: 'TW', dialCode: '+886', flag: '🇹🇼' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: '🇬🇷' },
  { name: 'Czech Republic', code: 'CZ', dialCode: '+420', flag: '🇨🇿' },
  { name: 'Romania', code: 'RO', dialCode: '+40', flag: '🇷🇴' },
  { name: 'Hungary', code: 'HU', dialCode: '+36', flag: '🇭🇺' },
  { name: 'Chile', code: 'CL', dialCode: '+56', flag: '🇨🇱' },
  { name: 'Peru', code: 'PE', dialCode: '+51', flag: '🇵🇪' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380', flag: '🇺🇦' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺' }
];

export interface PhoneInputProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (value: string, meta?: { country: Country; nationalNumber: string }) => void;
  defaultCountry?: string; // 'IN', 'US', etc. Default 'IN'
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  hasError?: boolean;
  className?: string;
  containerClassName?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function PhoneInput({
  id,
  name,
  value = '',
  onChange,
  defaultCountry = 'IN',
  placeholder = '98765 43210',
  disabled = false,
  required = false,
  hasError = false,
  className,
  containerClassName,
  onBlur
}: PhoneInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Find initial default country (India by default)
  const initialCountry = useMemo(() => {
    return COUNTRIES.find(c => c.code.toUpperCase() === defaultCountry.toUpperCase()) || COUNTRIES[0];
  }, [defaultCountry]);

  const [selectedCountry, setSelectedCountry] = useState<Country>(initialCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);

  // Parse national number from incoming value
  // If value starts with a known dial code, update selected country and strip dial code
  const nationalNumber = useMemo(() => {
    if (!value) return '';
    const trimmed = value.trim();
    if (trimmed.startsWith('+')) {
      if (trimmed.startsWith(selectedCountry.dialCode)) {
        return trimmed.slice(selectedCountry.dialCode.length).trim();
      }
      // Find matching country with longest dial code match
      const matchingCountry = [...COUNTRIES]
        .sort((a, b) => b.dialCode.length - a.dialCode.length)
        .find(c => trimmed.startsWith(c.dialCode));
      if (matchingCountry) {
        return trimmed.slice(matchingCountry.dialCode.length).trim();
      }
    }
    return trimmed;
  }, [value, selectedCountry.dialCode]);

  // Synchronize country if value contains an explicit country code prefix
  useEffect(() => {
    if (!value) return;
    const trimmed = value.trim();
    if (trimmed.startsWith('+')) {
      if (trimmed.startsWith(selectedCountry.dialCode)) {
        return;
      }
      const match = [...COUNTRIES]
        .sort((a, b) => b.dialCode.length - a.dialCode.length)
        .find(c => trimmed.startsWith(c.dialCode));
      if (match && match.code !== selectedCountry.code) {
        setSelectedCountry(match);
      }
    }
  }, [value, selectedCountry.dialCode, selectedCountry.code]);

  // Filter countries according to search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Reset highlight index when search results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredCountries]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      numberInputRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredCountries.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCountries[highlightedIndex]) {
        handleSelectCountry(filteredCountries[highlightedIndex]);
      }
    }
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');

    // Emit updated combined value
    if (nationalNumber) {
      const cleanDigits = nationalNumber.replace(/\D/g, '');
      const full = cleanDigits ? `${country.dialCode}${cleanDigits}` : '';
      onChange?.(full, { country, nationalNumber: cleanDigits });
    } else {
      onChange?.('', { country, nationalNumber: '' });
    }

    setTimeout(() => {
      numberInputRef.current?.focus();
    }, 50);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Keep only digits and space/hyphen for user readability
    const sanitized = rawVal.replace(/[^\d\s-]/g, '');
    const cleanDigits = sanitized.replace(/\D/g, '');

    // If empty, emit empty string (optional field)
    const full = cleanDigits ? `${selectedCountry.dialCode}${cleanDigits}` : '';
    onChange?.(full, { country: selectedCountry, nationalNumber: cleanDigits });
  };

  return (
    <div ref={containerRef} className={cn('relative w-full text-left font-sans', className)}>
      {/* Input container */}
      <div
        className={cn(
          'flex items-center w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border transition-all h-10',
          hasError
            ? 'border-red-400 dark:border-red-500/50 ring-1 ring-red-400/30'
            : 'border-slate-200 dark:border-slate-800 focus-within:ring-1 focus-within:ring-[#0a66c2] focus-within:border-[#0a66c2]',
          containerClassName
        )}
      >
        {/* Country Code Trigger Button (Stable & Uneditable prefix) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          title={`Country Code: ${selectedCountry.name} (${selectedCountry.dialCode})`}
          className={cn(
            'flex items-center gap-1.5 pl-3 pr-2.5 h-full text-xs font-semibold select-none shrink-0 transition-colors',
            'bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/80',
            'text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 rounded-l-sm',
            'disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'
          )}
        >
          <span className="text-base leading-none" role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span className="font-mono text-[13px] font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-slate-400 transition-transform duration-200',
              isOpen && 'rotate-180 text-[#0a66c2]'
            )}
          />
        </button>

        {/* National Phone Number Text Input */}
        <div className="relative flex-1 flex items-center h-full">
          <input
            ref={numberInputRef}
            id={inputId}
            name={name}
            type="tel"
            inputMode="tel"
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            value={nationalNumber}
            onChange={handleNumberChange}
            onBlur={onBlur}
            className={cn(
              'w-full h-full bg-transparent text-slate-900 dark:text-white pl-3.5 pr-4 text-sm outline-none font-medium',
              'placeholder:text-slate-400 dark:placeholder:text-slate-600 tracking-wide',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          />

          {/* Optional quick clear button when typed */}
          {nationalNumber && !disabled && (
            <button
              type="button"
              onClick={() => {
                onChange?.('', { country: selectedCountry, nationalNumber: '' });
                numberInputRef.current?.focus();
              }}
              className="mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full transition-colors cursor-pointer"
              title="Clear phone number"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Searchable Country Dropdown Popover */}
      {isOpen && (
        <div
          onKeyDown={handleKeyDown}
          style={{ height: 'auto', maxHeight: '360px' }}
          className={cn(
            'absolute z-50 left-0 mt-1.5 w-full max-w-[360px] sm:w-[320px] rounded-sm',
            'bg-white dark:bg-[#121320] border border-slate-200 dark:border-slate-800',
            'shadow-[0_12px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.5)]',
            'overflow-hidden animate-in fade-in zoom-in-95 duration-150'
          )}
        >
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search country or dial code..."
                className={cn(
                  'w-full pl-8 pr-7 py-1.5 text-xs rounded-sm outline-none',
                  'bg-white dark:bg-[#181928] text-slate-900 dark:text-white',
                  'border border-slate-200 dark:border-slate-700/60 focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]/50',
                  'placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium'
                )}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Country List */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto overflow-x-hidden p-1 space-y-0.5 text-xs scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
          >
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-slate-400 dark:text-slate-500 font-medium">
                <Phone className="h-4 w-4 mx-auto mb-1.5 opacity-40" />
                No countries found
              </div>
            ) : (
              filteredCountries.map((country, index) => {
                const isSelected = country.code === selectedCountry.code;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectCountry(country)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-left transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#0a66c2]/10 text-[#0a66c2] dark:text-[#70b5f9] font-semibold'
                        : isHighlighted
                        ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-base leading-none shrink-0" role="img" aria-label={country.name}>
                        {country.flag}
                      </span>
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {country.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 uppercase tracking-wider">
                        {country.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {country.dialCode}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#0a66c2] dark:text-[#70b5f9]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Helper Footer */}
          <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/70 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between font-medium">
            <span>Default: India (+91)</span>
            <span>{filteredCountries.length} countries</span>
          </div>
        </div>
      )}
    </div>
  );
}
