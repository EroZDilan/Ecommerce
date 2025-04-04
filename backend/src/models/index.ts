// src/models/index.ts
// Este archivo exporta todos los modelos para facilitar la importación
// y evitar problemas de referencias circulares

export { BaseEntity } from './base.model';
export { AgencyModel, AgencyType } from './agency.model';
export { UserModel, UserRole } from './user.model';
export { DepartmentModel } from './department.model';
export { ProductModel, ProductType, InventoryType } from './product.model';
export {
  ProductPriceModel,
  CurrencyRateModel,
  PriceAudienceType,
  PriceType,
  CurrencyType,
} from './price.model';
