import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import uploadConfig from '../config/import';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();

  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transacion = await createTransaction.execute({
    title,
    type,
    value,
    category,
  });

  return response.json(transacion);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.json({ message: 'deleted transaction' });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const transactionsReadStram = fs.createReadStream(
      path.resolve(uploadConfig.directory, request.file.filename),
    );

    const importTransaction = new ImportTransactionsService();

    const transaction = await importTransaction.execute(transactionsReadStram);

    return response.json(transaction);
  },
);

export default transactionsRouter;
