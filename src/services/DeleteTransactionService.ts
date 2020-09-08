import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transaction = await transactionsRepository.findOne({
      where: { id },
    });

    if (transaction) {
      await transactionsRepository.delete(id);
    } else {
      throw new AppError('Transaction does not exist');
    }
  }
}

export default DeleteTransactionService;
