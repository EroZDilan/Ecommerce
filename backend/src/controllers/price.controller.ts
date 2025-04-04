// src/controllers/price.controller.ts
import { Request, Response, NextFunction } from "express";
import priceService from "../services/price.service";
import { BadRequestError } from "../utils/errors";

export class PriceController {
  // Crear un nuevo precio para un producto
  async createPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const priceData = req.body;

      if (!priceData.productId) {
        throw new BadRequestError("El ID del producto es requerido");
      }

      const newPrice = await priceService.createPrice(
        priceData,
        req.currentUser
      );
      res.status(201).json(newPrice);
    } catch (error) {
      next(error);
    }
  }

  // Actualizar un precio existente
  async updatePrice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const priceData = req.body;

      const updatedPrice = await priceService.updatePrice(
        id,
        priceData,
        req.currentUser
      );
      res.json(updatedPrice);
    } catch (error) {
      next(error);
    }
  }

  // Obtener un precio por su ID
  async getPriceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const price = await priceService.getPriceById(id);
      res.json(price);
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los precios de un producto
  async getProductPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const prices = await priceService.getProductPrices(
        productId,
        req.currentUser
      );
      res.json(prices);
    } catch (error) {
      next(error);
    }
  }

  // Obtener precios específicos para una agencia
  async getAgencyPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const { agencyId } = req.params;
      const prices = await priceService.getAgencyPrices(
        agencyId,
        req.currentUser
      );
      res.json(prices);
    } catch (error) {
      next(error);
    }
  }

  // Establecer precio visible para clientes
  async setCustomerVisiblePrice(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { visible } = req.body;

      if (visible === undefined) {
        throw new BadRequestError("Es necesario especificar la visibilidad");
      }

      const price = await priceService.setCustomerVisiblePrice(
        id,
        visible,
        req.currentUser
      );
      res.json(price);
    } catch (error) {
      next(error);
    }
  }

  // Establecer precio visible para agencias
  async setAgencyVisiblePrice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { visible } = req.body;

      if (visible === undefined) {
        throw new BadRequestError("Es necesario especificar la visibilidad");
      }

      const price = await priceService.setAgencyVisiblePrice(
        id,
        visible,
        req.currentUser
      );
      res.json(price);
    } catch (error) {
      next(error);
    }
  }

  // Establecer tasa de cambio para una moneda
  async setCurrencyRate(req: Request, res: Response, next: NextFunction) {
    try {
      const rateData = req.body;

      if (!rateData.currency || !rateData.rateToUSD) {
        throw new BadRequestError("La moneda y la tasa son requeridas");
      }

      const rate = await priceService.setCurrencyRate(
        rateData,
        req.currentUser
      );
      res.json(rate);
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las tasas de cambio
  async getCurrencyRates(req: Request, res: Response, next: NextFunction) {
    try {
      const rates = await priceService.getCurrencyRates();
      res.json(rates);
    } catch (error) {
      next(error);
    }
  }

  // Convertir precio entre monedas
  async convertPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;

      if (!amount || !fromCurrency || !toCurrency) {
        throw new BadRequestError(
          "Todos los parámetros son requeridos: amount, fromCurrency, toCurrency"
        );
      }

      const convertedPrice = await priceService.convertPrice(
        parseFloat(amount),
        fromCurrency,
        toCurrency
      );

      res.json({
        originalAmount: parseFloat(amount),
        originalCurrency: fromCurrency,
        convertedAmount: convertedPrice,
        targetCurrency: toCurrency,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PriceController();
