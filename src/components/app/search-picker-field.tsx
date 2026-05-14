"use client";

import * as React from "react";

import { SearchPicker, type SearchPickerOption } from "@/components/ui/search-picker";

export function SearchPickerField({
  id,
  name,
  defaultValue,
  options,
  placeholder,
  inputPlaceholder,
  className,
  contentClassName,
}: {
  id?: string;
  name: string;
  defaultValue?: string;
  options: SearchPickerOption[];
  placeholder?: string;
  inputPlaceholder?: string;
  className?: string;
  contentClassName?: string;
}) {
  const [value, setValue] = React.useState(defaultValue ?? "");

  return (
    <>
      <input type="hidden" id={id} name={name} value={value} />
      <SearchPicker
        value={value}
        options={options}
        onValueChange={setValue}
        placeholder={placeholder}
        inputPlaceholder={inputPlaceholder}
        className={className}
        contentClassName={contentClassName}
      />
    </>
  );
}
