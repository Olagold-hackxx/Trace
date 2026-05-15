import { DefaultNamingStrategy } from "typeorm";

function snake(str: string): string {
  return str
    .replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`)
    .replace(/^_/, "");
}

export class SnakeNamingStrategy extends DefaultNamingStrategy {
  override tableName(className: string, customName?: string): string {
    return customName ?? snake(className);
  }

  override columnName(propertyName: string, customName?: string, embeddedPrefixes: string[] = []): string {
    const base = customName ?? snake(propertyName);
    return embeddedPrefixes.length
      ? `${embeddedPrefixes.map(snake).join("_")}_${base}`
      : base;
  }

  override relationName(propertyName: string): string {
    return snake(propertyName);
  }

  override joinColumnName(relationName: string, referencedColumnName: string): string {
    return snake(`${relationName}_${referencedColumnName}`);
  }

  override joinTableName(firstTableName: string, _secondTableName: string, firstPropertyName: string): string {
    return snake(`${firstTableName}_${firstPropertyName}`);
  }

  override joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
    return snake(`${tableName}_${columnName ?? propertyName}`);
  }
}
