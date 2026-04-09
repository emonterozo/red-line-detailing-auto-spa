import { FieldLabel, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ReadOnlyField({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <Field>
      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
        {label}
      </FieldLabel>
      <Input
        readOnly
        placeholder="Not applicable"
        value={value}
        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 text-sm
             focus-visible:outline-none focus-visible:ring-0 focus-visible:border-white/10"
      />
    </Field>
  );
}