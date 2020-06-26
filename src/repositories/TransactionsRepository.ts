import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private sumTransactionsByType(
    transactions: Transaction[],
    type: 'income' | 'outcome',
  ): number {
    const filteredTransactions = transactions.filter(
      transaction => transaction.type === type,
    );

    const sumFilteredTransactions = filteredTransactions.reduce(
      (accumulator, transaction) => accumulator + transaction.value,
      0,
    );

    return sumFilteredTransactions;
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const sumIncome = this.sumTransactionsByType(transactions, 'income');

    const sumOutcome = this.sumTransactionsByType(transactions, 'outcome');

    const balance = {
      income: sumIncome,
      outcome: sumOutcome,
      total: sumIncome - sumOutcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
