'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface MappingItem {
  csvColumn: string;
  crmField: string | null;
}

interface FieldMappingInterfaceProps {
  mappings: MappingItem[];
  onMappingChange: (csvColumn: string, crmField: string | null) => void;
}

const CRM_FIELDS = [
  { value: 'created_at', label: 'Created At' },
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'country_code', label: 'Country Code' },
  { value: 'mobile_without_country_code', label: 'Mobile (No Country Code)' },
  { value: 'company', label: 'Company' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'country', label: 'Country' },
  { value: 'lead_owner', label: 'Lead Owner' },
  { value: 'crm_status', label: 'CRM Status' },
  { value: 'crm_note', label: 'CRM Note' },
  { value: 'data_source', label: 'Data Source' },
  { value: 'possession_time', label: 'Possession Time' },
  { value: 'description', label: 'Description' },
];

export function FieldMappingInterface({ mappings, onMappingChange }: FieldMappingInterfaceProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {mappings.map((mapping, index) => (
          <div key={index} className="flex items-center gap-4 p-3 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <Badge variant="outline" className="mb-1 bg-background text-sm font-normal py-1 px-3 border-primary/20 text-primary">
                CSV Column
              </Badge>
              <p className="font-semibold text-foreground mt-1 truncate">{mapping.csvColumn}</p>
            </div>
            
            <div className="flex items-center justify-center text-muted-foreground px-4">
              <ArrowRight className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <Badge variant="secondary" className="mb-2 text-xs">CRM Field</Badge>
              <Select
                value={mapping.crmField || 'unmapped'}
                onValueChange={(val) => onMappingChange(mapping.csvColumn, val === 'unmapped' ? null : val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select CRM Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unmapped" className="text-muted-foreground italic">
                    -- Do not import --
                  </SelectItem>
                  {CRM_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
