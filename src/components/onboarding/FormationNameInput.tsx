import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface FormationNameInputProps {
  value: string;
  onChange: (value: string) => void;
  seriesNumber: number | null;
}

const MASTER_LLC = "Tokenizio RWA LLC";

function validateName(name: string): { valid: boolean; message: string } {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, message: "Enter a descriptive name for your series." };
  if (trimmed.length < 2) return { valid: false, message: "Name must be at least 2 characters." };
  if (trimmed.length > 80) return { valid: false, message: "Name must be 80 characters or fewer." };
  if (/[^a-zA-Z0-9\s\-&.]/.test(trimmed)) return { valid: false, message: "Only letters, numbers, spaces, hyphens, ampersands, and periods are allowed." };
  return { valid: true, message: "" };
}

const FormationNameInput = ({ value, onChange, seriesNumber }: FormationNameInputProps) => {
  const validation = validateName(value);
  const fullName = value.trim() && seriesNumber
    ? `${MASTER_LLC} - ${value.trim()} - Series ${String(seriesNumber).padStart(3, "0")}`
    : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company-name" className="text-sm font-medium">
          Descriptive Name
        </Label>
        <Input
          id="company-name"
          placeholder='e.g. "Acme Holdings" or "Digital Assets Fund"'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            value && !validation.valid && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {value && !validation.valid && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle size={12} /> {validation.message}
          </p>
        )}
      </div>

      {fullName && validation.valid && (
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Full Legal Name
          </p>
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 size={14} className="text-accent shrink-0" />
            {fullName}
          </p>
          <p className="text-xs text-muted-foreground">
            Jurisdiction: Wyoming, USA · Master LLC: {MASTER_LLC}
          </p>
        </div>
      )}
    </div>
  );
};

export { validateName, MASTER_LLC };
export default FormationNameInput;
