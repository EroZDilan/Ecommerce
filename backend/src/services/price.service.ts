// src/services/price.service.ts
import { FindOneOptions } from 'typeorm';
import { ProductPriceModel, PriceAudienceType, CurrencyRateModel } from '../models/price.model';
import { UserRole } from '../models/user.model';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { getRepository } from '../global';

export class PriceService {
  // Crear un nuevo precio para un producto
  async createPrice(
    priceData: Partial<ProductPriceModel>,
    currentUser: any
  ): Promise<ProductPriceModel> {
    const priceRepository = getRepository(ProductPriceModel);

    // Validar permisos según el tipo de audiencia
    this.validatePricePermissions(priceData, currentUser);

    // Crear y guardar el precio
    const newPrice = priceRepository.create(priceData);
    return priceRepository.save(newPrice) as Promise<ProductPriceModel>;
  }

  // Actualizar un precio existente
  async updatePrice(
    id: string,
    priceData: Partial<ProductPriceModel>,
    currentUser: any
  ): Promise<ProductPriceModel> {
    const priceRepository = getRepository(ProductPriceModel);

    const price = await this.getPriceById(id);

    // Validar permisos según el tipo de audiencia
    this.validatePricePermissions({ ...price, ...priceData }, currentUser);

    // Actualizar y guardar
    Object.assign(price, priceData);
    return priceRepository.save(price) as Promise<ProductPriceModel>;
  }

  // Obtener un precio por su ID
  async getPriceById(id: string): Promise<ProductPriceModel> {
    const priceRepository = getRepository(ProductPriceModel);

    const price = await priceRepository.findOne({
      where: { id },
      relations: ['product', 'agency'],
    } as FindOneOptions<ProductPriceModel>);

    if (!price) {
      throw new NotFoundError('Precio no encontrado');
    }

    return price as ProductPriceModel;
  }

  // Obtener todos los precios de un producto con filtros
  async getProductPrices(productId: string, currentUser: any): Promise<ProductPriceModel[]> {
    const priceRepository = getRepository(ProductPriceModel);

    const queryBuilder = priceRepository
      .createQueryBuilder('price')
      .leftJoinAndSelect('price.product', 'product')
      .leftJoinAndSelect('price.agency', 'agency')
      .where('price.productId = :productId', { productId })
      .andWhere('price.activo = :activo', { activo: true });

    // Aplicar filtros según el rol del usuario
    switch (currentUser.role) {
      case UserRole.SUPER_ADMIN:
        // Super admin puede ver todos los precios
        break;

      case UserRole.AGENCY_ADMIN:
      case UserRole.AGENCY_USER:
        // Usuarios de agencia ven precios públicos y los de su agencia
        queryBuilder.andWhere(
          '(price.audienceType = :publicType OR (price.audienceType = :agencyType AND price.agencyId = :agencyId))',
          {
            publicType: PriceAudienceType.PUBLIC,
            agencyType: PriceAudienceType.AGENCY,
            agencyId: currentUser.agencyId,
          }
        );
        break;

      case UserRole.CUSTOMER:
      default:
        // Clientes solo ven precios públicos
        queryBuilder.andWhere('price.audienceType = :publicType', {
          publicType: PriceAudienceType.PUBLIC,
        });
        queryBuilder.andWhere('price.visibleClientes = :visible', {
          visible: true,
        });
        break;
    }

    return queryBuilder.getMany() as Promise<ProductPriceModel[]>;
  }

  // Obtener precios específicos para una agencia
  async getAgencyPrices(agencyId: string, currentUser: any): Promise<ProductPriceModel[]> {
    const priceRepository = getRepository(ProductPriceModel);

    // Validar que el usuario tenga permisos para ver precios de esta agencia
    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      (currentUser.role !== UserRole.AGENCY_ADMIN || currentUser.agencyId !== agencyId)
    ) {
      throw new UnauthorizedError('No tienes permisos para ver los precios de esta agencia');
    }

    return priceRepository.find({
      where: {
        agencyId,
        audienceType: PriceAudienceType.AGENCY,
        activo: true,
      },
      relations: ['product', 'agency'],
    }) as Promise<ProductPriceModel[]>;
  }

  // Establecer precio visible para clientes
  async setCustomerVisiblePrice(
    priceId: string,
    visible: boolean,
    currentUser: any
  ): Promise<ProductPriceModel> {
    const priceRepository = getRepository(ProductPriceModel);

    const price = await this.getPriceById(priceId);

    // Solo super admin o admin de la agencia pueden cambiar la visibilidad
    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      price.agencyId &&
      currentUser.agencyId !== price.agencyId
    ) {
      throw new UnauthorizedError('No tienes permisos para modificar este precio');
    }

    price.visibleClientes = visible;
    return priceRepository.save(price);
  }

  // Establecer precio visible para agencias
  async setAgencyVisiblePrice(
    priceId: string,
    visible: boolean,
    currentUser: any
  ): Promise<ProductPriceModel> {
    const priceRepository = getRepository(ProductPriceModel);

    const price = await this.getPriceById(priceId);

    // Solo super admin puede cambiar la visibilidad para agencias
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedError('No tienes permisos para modificar la visibilidad para agencias');
    }

    price.visibleAgencias = visible;
    return priceRepository.save(price);
  }

  // Métodos para gestionar tasas de cambio
  async setCurrencyRate(
    data: Partial<CurrencyRateModel>,
    currentUser: any
  ): Promise<CurrencyRateModel> {
    const currencyRateRepository = getRepository(CurrencyRateModel);

    // Solo super admin puede modificar tasas de cambio
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedError('No tienes permisos para modificar tasas de cambio');
    }

    const existingRate = await currencyRateRepository.findOne({
      where: { currency: data.currency },
    } as FindOneOptions<CurrencyRateModel>);

    if (existingRate) {
      // Actualizar tasa existente
      Object.assign(existingRate, data);
      return currencyRateRepository.save(existingRate) as Promise<CurrencyRateModel>;
    } else {
      // Crear nueva tasa
      const newRate = currencyRateRepository.create(data);
      return currencyRateRepository.save(newRate) as Promise<CurrencyRateModel>;
    }
  }

  async getCurrencyRates(): Promise<CurrencyRateModel[]> {
    const currencyRateRepository = getRepository(CurrencyRateModel);
    return currencyRateRepository.find() as Promise<CurrencyRateModel[]>;
  }

  // Método utilitario para convertir precios entre monedas
  async convertPrice(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    // Si las monedas son iguales, no hay conversión
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Obtener tasas de cambio
    const rates = await this.getCurrencyRates();
    const fromRate = rates.find((r) => r.currency === fromCurrency);
    const toRate = rates.find((r) => r.currency === toCurrency);

    if (!fromRate || !toRate) {
      throw new BadRequestError('Moneda no soportada para conversión');
    }

    // Convertir a USD primero (si no es USD)
    let usdAmount = amount;
    if (fromCurrency !== 'usd') {
      usdAmount = amount / fromRate.rateToUSD;
    }

    // Convertir de USD a la moneda destino (si no es USD)
    if (toCurrency === 'usd') {
      return usdAmount;
    } else {
      return usdAmount * toRate.rateToUSD;
    }
  }

  // Validar permisos de modificación de precios
  private validatePricePermissions(priceData: Partial<ProductPriceModel>, currentUser: any): void {
    // Super admin puede crear/modificar cualquier tipo de precio
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return;
    }

    // Validaciones para admin de agencia
    if (currentUser.role === UserRole.AGENCY_ADMIN) {
      // Solo puede crear/modificar precios para su agencia
      if (priceData.audienceType === PriceAudienceType.AGENCY) {
        if (priceData.agencyId !== currentUser.agencyId) {
          throw new UnauthorizedError('Solo puedes gestionar precios para tu agencia');
        }
      } else if (priceData.audienceType === PriceAudienceType.PUBLIC) {
        throw new UnauthorizedError('No puedes gestionar precios públicos');
      }
      return;
    }

    // Los demás usuarios no pueden modificar precios
    throw new UnauthorizedError('No tienes permisos para gestionar precios');
  }
}

export default new PriceService();
