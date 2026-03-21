'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { Input } from './input';
import { Label, Text } from './typography';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface SearchableSelectOption {
  value: string;
  label: string;
}

export interface SearchableSelectProps {
  label: string;
  name?: string;
  inputId: string;
  options: SearchableSelectOption[];
  placeholder: string;
  value: string;
  displayValue?: string | undefined;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  helperText?: string | null | undefined;
  errorText?: string | null | undefined;
  emptyText?: string | null | undefined;
  loadingText?: string | null | undefined;
  isLoading?: boolean;
  className?: string | undefined;
}

function sortOptions(options: SearchableSelectOption[]): SearchableSelectOption[] {
  return [...options].sort((left, right) => left.label.localeCompare(right.label));
}

export function SearchableSelect({
  label,
  name,
  inputId,
  options,
  placeholder,
  value,
  displayValue,
  onChange,
  required = false,
  disabled = false,
  helperText,
  errorText,
  emptyText,
  loadingText,
  isLoading = false,
  className,
}: SearchableSelectProps) {
  const datalistId = useId();
  const sortedOptions = useMemo(() => sortOptions(options), [options]);
  const selectedOption = sortedOptions.find((option) => option.value === value);
  const resolvedLabel = displayValue ?? selectedOption?.label ?? '';
  const [query, setQuery] = useState(resolvedLabel);

  useEffect(() => {
    setQuery(resolvedLabel);
  }, [resolvedLabel]);

  const hasOptions = sortedOptions.length > 0;
  const lowerQuery = query.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!lowerQuery) {
      return sortedOptions;
    }

    return sortedOptions.filter((option) => option.label.toLowerCase().includes(lowerQuery));
  }, [lowerQuery, sortedOptions]);

  const message = errorText
    ? errorText
    : isLoading
      ? loadingText
      : !hasOptions
        ? emptyText
        : helperText;

  return (
    <div className={cx('space-y-2', className)}>
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        autoComplete="off"
        disabled={disabled || isLoading}
        id={inputId}
        list={datalistId}
        onBlur={() => {
          if (!query.trim()) {
            onChange('');
            setQuery('');
            return;
          }

          const matched = sortedOptions.find(
            (option) => option.label.toLowerCase() === query.trim().toLowerCase(),
          );
          if (matched) {
            setQuery(matched.label);
            onChange(matched.value);
          }
        }}
        onChange={(event) => {
          const nextQuery = event.target.value;
          setQuery(nextQuery);
          const matched = sortedOptions.find(
            (option) => option.label.toLowerCase() === nextQuery.trim().toLowerCase(),
          );
          onChange(matched?.value ?? '');
        }}
        placeholder={placeholder}
        required={required}
        value={query}
      />
      {name ? <input name={name} type="hidden" value={value} /> : null}
      <datalist id={datalistId}>
        {filteredOptions.map((option) => (
          <option key={option.value} value={option.label} />
        ))}
      </datalist>
      {message ? <Text tone={errorText ? 'danger' : 'muted'}>{message}</Text> : null}
    </div>
  );
}
