export const API_BASE_URL = "http://localhost:8000";

export const getFieldType = (
  fieldType: string,
  value: string | boolean | number,
) => {
  if (typeof value !== "string") return value;

  switch (fieldType) {
    case "INT":
    case "NUMBER":
      return parseInt(value);
    case "BOOL":
      return Boolean(value);
  }
  return value;
};

export function orderList(list: object[], orderField: string = "id", desc = false) {
  const newList = [...list];
  newList.sort((a, b) => {
    return desc
      ? (b?.[orderField] ?? 0) - (a?.[orderField] ?? 0)
      : (a?.[orderField] ?? 0) - (b?.[orderField] ?? 0);
  });
  return newList;
}
