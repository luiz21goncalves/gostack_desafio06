import { Readable } from 'stream';
import csvParse from 'csv-parse';
import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

class ImportTransactionsService {
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

  async execute(transactionsReadStram: Readable): Promise<Transaction[]> {
    const parsers = csvParse({ delimiter: ',' });

    const parseCSV = transactionsReadStram.pipe(parsers);

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      const usedCategory = await this.findOrCreateCategory(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));
  }
}

export default ImportTransactionsService;
