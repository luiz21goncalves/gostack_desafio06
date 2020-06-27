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

    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    let usedCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!usedCategory) {
      usedCategory = categoriesRepository.create({ title: category });

      await categoriesRepository.save(usedCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: usedCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
