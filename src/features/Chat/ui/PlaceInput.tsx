"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

/** Text-only place entry shared by plan forms and chat place messages. */
export function PlaceInput({ value, onChange, label = "Place", placeholder = "Enter a place" }: Props) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label} <span className="font-normal text-muted-foreground">Optional</span>
      <input
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={255}
        placeholder={placeholder}
      />
    </label>
  );
}
