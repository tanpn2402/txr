import { Combobox, TextInput, type TextInputProps, useCombobox } from '@mantine/core';
import { useState } from 'react';

export type ComboBoxProps<T> = {
  valueField?: keyof T;
  labelField?: keyof T;
  options: T[];
  value?: T;
  onChange: (value?: T) => void;
  valueToString?: (value: T) => string;
  getLabel?: (value: T) => string;
  inputProps?: TextInputProps;
};

export function ComboBox<T>({
  options,
  value,
  inputProps,
  labelField = 'label' as keyof T,
  valueField = 'value' as keyof T,
  onChange,
  valueToString = (val) => String(val?.[valueField] ?? ''),
  getLabel = (val) => String(val?.[labelField] ?? ''),
}: ComboBoxProps<T>) {
  const [searchTerm, setSearchTerm] = useState<string>();

  const combobox = useCombobox({
    onDropdownClose(eventSource) {
      if (searchTerm && eventSource === 'unknown') {
        onChange(options.find((item) => searchTerm === getLabel(item)));
        setSearchTerm(undefined);
      }
    },
  });

  const shouldFilterOptions = !options.some((item) => valueToString(item) === searchTerm);
  const filteredOptions =
    shouldFilterOptions && searchTerm
      ? options.filter((item) =>
          getLabel(item).toLowerCase().includes(String(searchTerm).toLowerCase().trim())
        )
      : options;

  const comboboxOptions = filteredOptions.map((item) => (
    <Combobox.Option
      style={{
        fontSize: 18,
      }}
      value={valueToString(item)}
      key={valueToString(item)}
      className="text-xl"
    >
      {getLabel(item)}
    </Combobox.Option>
  ));

  return (
    <Combobox
      offset={1}
      onOptionSubmit={(optionValue) => {
        const selected = options.find((item) => optionValue === valueToString(item));
        onChange(selected);
        setSearchTerm(undefined);
        combobox.closeDropdown('keyboard');
        combobox.resetSelectedOption();
      }}
      store={combobox}
    >
      <Combobox.Target>
        <TextInput
          {...inputProps}
          value={searchTerm ?? (value ? getLabel(value) : '') ?? ''}
          onChange={(event) => {
            setSearchTerm(event.currentTarget.value);
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          onKeyDown={(ev) => {
            if (ev.code === 'Enter') {
              ev.preventDefault();
            }
          }}
        />
      </Combobox.Target>

      <Combobox.Dropdown className="border-2! border-[#ced4da]! shadow-lg!">
        <Combobox.Options>
          {comboboxOptions.length === 0 ? (
            <Combobox.Empty>Nothing found</Combobox.Empty>
          ) : (
            comboboxOptions
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
