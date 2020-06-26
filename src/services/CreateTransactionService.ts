import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  private findOrCreateCategory(title: string): Category {
    const categoriesRepository = getRepository(Category);
  }

  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    if (value <= 0) {
      throw new AppError('Entre transaction value');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (balance.total - value < 0) {
      throw new AppError('There is no balance for transaction');
    }

    const usedCategory = this.findOrCreateCategory(category);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: usedCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
