# Validaciones (`src/features/validations/`)

## Estructura
```
validations/
  ValidationForm.tsx       → ValidationForm (crear/editar)
  ValidationList.tsx       → ValidationList (lista)
  validationService.ts     → servicios API
  validationUtils.ts       → utilidades
```

## Componentes

### `ValidationList` — `ValidationList.tsx`
Lista de reglas de validación para un campo de lead.
- Se muestra dentro del detalle de `LeadField`
- Lista con acciones: editar, eliminar

### `ValidationForm` — `ValidationForm.tsx`
Formulario de creación/edición de regla de validación:
- Nombre de la regla
- Template (regla predefinida: required, min, max, regex, etc.) o expresión manual
- Parámetros del template (según cada tipo)
- Mensaje de error personalizado
- Se abre como sidebar

## Servicios (`validationService.ts`)
```tsx
getValidationRules(fieldId) → FieldValidationRule[]
getValidationRule(id) → FieldValidationRuleDetailed
createValidationRule(data) → FieldValidationRule
updateValidationRule(id, data) → FieldValidationRule
deleteValidationRule(id) → DeleteResponse
getValidationTemplates() → FieldValidationRuleTemplate[]
```

## Utilidades (`validationUtils.ts`)
- Helpers para construir params de templates de validación según tipo
