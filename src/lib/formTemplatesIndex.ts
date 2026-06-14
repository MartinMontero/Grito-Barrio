/**
 * Form Templates Index
 * Protocolo CDMX
 *
 * Combined export of all form templates
 */

import {
  INCIDENT_REPORT_TEMPLATE,
  WITNESS_STATEMENT_TEMPLATE,
  FORM_TEMPLATES as BASE_FORM_TEMPLATES,
} from "./formTemplates";

import {
  CHAIN_OF_CUSTODY_TEMPLATE,
  PAS_EVALUATION_TEMPLATE,
  LEGAL_TRIAGE_TEMPLATE,
  CHECKLIST_60MIN_TEMPLATE,
  ADDITIONAL_FORM_TEMPLATES,
} from "./formTemplatesAdditional";

import type { FormTemplate, FormType } from "@/types/forms";

// Combine all templates
export const ALL_FORM_TEMPLATES: Record<FormType, FormTemplate> = {
  incident_report: INCIDENT_REPORT_TEMPLATE,
  witness_statement: WITNESS_STATEMENT_TEMPLATE,
  chain_of_custody: CHAIN_OF_CUSTODY_TEMPLATE,
  pas_evaluation: PAS_EVALUATION_TEMPLATE,
  legal_triage: LEGAL_TRIAGE_TEMPLATE,
  checklist_60min: CHECKLIST_60MIN_TEMPLATE,
  supply_checklist: INCIDENT_REPORT_TEMPLATE, // Placeholder - would need actual template
  emergency_contacts: INCIDENT_REPORT_TEMPLATE, // Placeholder - would need actual template
};

// Export individual templates
export {
  INCIDENT_REPORT_TEMPLATE,
  WITNESS_STATEMENT_TEMPLATE,
  CHAIN_OF_CUSTODY_TEMPLATE,
  PAS_EVALUATION_TEMPLATE,
  LEGAL_TRIAGE_TEMPLATE,
  CHECKLIST_60MIN_TEMPLATE,
};

// Export template collections
export { BASE_FORM_TEMPLATES, ADDITIONAL_FORM_TEMPLATES };

// Helper function to get template by type
export function getFormTemplate(type: FormType): FormTemplate {
  return ALL_FORM_TEMPLATES[type];
}

// Helper function to get all templates as array
export function getAllFormTemplates(): FormTemplate[] {
  return Object.values(ALL_FORM_TEMPLATES);
}

// Helper function to get templates by category
export function getFormTemplatesByCategory(
  category: "legal" | "emergency" | "checklist",
): FormTemplate[] {
  const categoryMap: Record<string, FormType[]> = {
    legal: ["witness_statement", "chain_of_custody", "legal_triage"],
    emergency: ["incident_report", "pas_evaluation"],
    checklist: ["checklist_60min", "supply_checklist"],
  };

  return (categoryMap[category] || []).map((type) => ALL_FORM_TEMPLATES[type]);
}

export default ALL_FORM_TEMPLATES;
