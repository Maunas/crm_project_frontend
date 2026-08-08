import type { Metadata } from "./shared";

export const TriggerEventEnum = {
  ON_CREATE: "ON_CREATE",
  ON_UPDATE: "ON_UPDATE",
} as const;
export type TriggerEventEnum = typeof TriggerEventEnum[keyof typeof TriggerEventEnum];

export const LogicalOperatorEnum = {
  AND: "AND",
  OR: "OR",
} as const;
export type LogicalOperatorEnum = typeof LogicalOperatorEnum[keyof typeof LogicalOperatorEnum];

export const ConditionOperatorEnum = {
  EQUALS: "EQUALS",
  NOT_EQUALS: "NOT_EQUALS",
  CONTAINS: "CONTAINS",
  NOT_CONTAINS: "NOT_CONTAINS",
  GREATER_THAN: "GREATER_THAN",
  LESS_THAN: "LESS_THAN",
  IS_EMPTY: "IS_EMPTY",
  IS_NOT_EMPTY: "IS_NOT_EMPTY",
} as const;
export type ConditionOperatorEnum = typeof ConditionOperatorEnum[keyof typeof ConditionOperatorEnum];

export const ActionTypeEnum = {
  SET_VALUE: "SET_VALUE",
  CLEAR_VALUE: "CLEAR_VALUE",
  COPY_FROM_FIELD: "COPY_FROM_FIELD",
  SET_CURRENT_DATE: "SET_CURRENT_DATE",
  SET_CURRENT_DATETIME: "SET_CURRENT_DATETIME",
} as const;
export type ActionTypeEnum = typeof ActionTypeEnum[keyof typeof ActionTypeEnum];

// ==========================================
// INTERFACES
// ==========================================
export interface RuleCondition {
  id?: string;
  type?: 'condition';
  field_id: string | null;
  operator: ConditionOperatorEnum;
  value?: string | number | boolean | null;
}

export interface RuleGroup {
  id?: string;
  type?: 'group';
  operator: LogicalOperatorEnum;
  rules: (RuleCondition | RuleGroup)[];
}

export interface AutomationAction {
  id?: string;
  type: ActionTypeEnum;
  target_field_id: number | null;
  value?: string | number | boolean | null;
  source_field_id?: number | null;
}

export interface FieldAutomationPost {
  name: string;
  description?: string;
  campaign_id: string;
  trigger_events: TriggerEventEnum[];
  priority: number;
  conditions: RuleGroup;
  actions: AutomationAction[];
}

export interface FieldAutomation extends FieldAutomationPost {
  id: string;
}

export interface FieldAutomationDetailed extends FieldAutomation, Metadata { }

// ==========================================
// LABELS Y DESCRIPCIONES
// ==========================================
export const TRIGGER_EVENT_LABELS: Record<TriggerEventEnum, string> = {
  [TriggerEventEnum.ON_CREATE]: 'Al crear registro',
  [TriggerEventEnum.ON_UPDATE]: 'Al actualizar registro',
};

export const CONDITION_OPERATOR_LABELS: Record<ConditionOperatorEnum, string> = {
  [ConditionOperatorEnum.EQUALS]: 'Es igual a',
  [ConditionOperatorEnum.NOT_EQUALS]: 'No es igual a',
  [ConditionOperatorEnum.CONTAINS]: 'Contiene',
  [ConditionOperatorEnum.NOT_CONTAINS]: 'No contiene',
  [ConditionOperatorEnum.GREATER_THAN]: 'Mayor que',
  [ConditionOperatorEnum.LESS_THAN]: 'Menor que',
  [ConditionOperatorEnum.IS_EMPTY]: 'Está vacío',
  [ConditionOperatorEnum.IS_NOT_EMPTY]: 'No está vacío',
};

export const ACTION_TYPE_LABELS: Record<ActionTypeEnum, string> = {
  [ActionTypeEnum.SET_VALUE]: 'Establecer valor',
  [ActionTypeEnum.CLEAR_VALUE]: 'Limpiar valor',
  [ActionTypeEnum.COPY_FROM_FIELD]: 'Copiar de otro campo',
  [ActionTypeEnum.SET_CURRENT_DATE]: 'Establecer fecha actual',
  [ActionTypeEnum.SET_CURRENT_DATETIME]: 'Establecer fecha y hora actual',
};

export const ACTION_TYPE_DESCRIPTIONS: Record<ActionTypeEnum, string> = {
  [ActionTypeEnum.SET_VALUE]: 'Asigna un valor específico al campo de destino',
  [ActionTypeEnum.CLEAR_VALUE]: 'Limpia/vacía el valor del campo de destino',
  [ActionTypeEnum.COPY_FROM_FIELD]: 'Copia el valor de otro campo al campo de destino',
  [ActionTypeEnum.SET_CURRENT_DATE]: 'Establece la fecha actual en el campo',
  [ActionTypeEnum.SET_CURRENT_DATETIME]: 'Establecer fecha y hora actual en el campo',
};

export const LOGICAL_OPERATOR_LABELS: Record<LogicalOperatorEnum, string> = {
  [LogicalOperatorEnum.AND]: 'Y (todas deben cumplirse)',
  [LogicalOperatorEnum.OR]: 'O (al menos una debe cumplirse)',
};
