import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const newCategory = this.categoryExists(category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type must be income or outcome');
    }

    if (
      type === 'outcome' &&
      value > (await transactionsRepository.getBalance()).total
    ) {
      throw new AppError(
        `This transaction value is more than you have in you account.`,
      );
    }
    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category_id: (await newCategory).id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }

  public async categoryExists(category: string): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!categoryExists) {
      const newCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(newCategory);
      return newCategory;
    }

    return categoryExists;
  }
}
export default CreateTransactionService;
