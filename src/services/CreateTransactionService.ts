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
  private async findOrCreateCategory(title: string): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const findCategory = await categoriesRepository.findOne({
      where: { title },
    });

    if (findCategory) {
      return findCategory;
    }

    const category = categoriesRepository.create({ title });

    await categoriesRepository.save(category);

    return category;
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

    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError('There is no balance for transaction');
    }

    const usedCategory = await this.findOrCreateCategory(category);

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
