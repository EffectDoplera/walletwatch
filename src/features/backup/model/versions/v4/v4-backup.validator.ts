import { isEqualSet } from "@shared/lib/itertools";

import { BackupValidationError } from "../../errors";

import { V4Backup } from "./v4-backup.schema";

function validateV4BackupCurrenciesConsistency(
  currencies: V4Backup["currencies"],
): Set<string> {
  const currencyOrderIds = new Set(currencies.order);
  const currencyKeyIds = new Set(Object.keys(currencies.currencies));
  if (!isEqualSet(currencyOrderIds, currencyKeyIds)) {
    throw new BackupValidationError();
  }
  for (const [currencyId, currency] of Object.entries(currencies.currencies)) {
    if (currencyId !== currency.id) {
      throw new BackupValidationError();
    }
  }
  return currencyOrderIds;
}

function validateV4BackupAccountsConsistency(
  accounts: V4Backup["accounts"],
  currencyIds: Set<string>,
): Set<string> {
  const accountOrderIds = new Set(accounts.order);
  const accountKeyIds = new Set(Object.keys(accounts.accounts));
  if (!isEqualSet(accountOrderIds, accountKeyIds)) {
    throw new BackupValidationError();
  }
  for (const [accountId, account] of Object.entries(accounts.accounts)) {
    if (accountId !== account.id || !currencyIds.has(account.currencyId)) {
      throw new BackupValidationError();
    }
  }
  return accountOrderIds;
}

function validateV4BackupCategoriesConsistency(
  categories: V4Backup["expenseCategories"] | V4Backup["incomeCategories"],
): Set<string> {
  const categoryIds = new Set(Object.keys(categories));
  for (const [categoryId, category] of Object.entries(categories)) {
    if (
      categoryId !== category.id ||
      (category.parentId !== null && !categoryIds.has(category.parentId))
    ) {
      throw new BackupValidationError();
    }
  }
  return categoryIds;
}

function validateV4BackupExpensesConsistency(
  expenses: V4Backup["expenses"],
  accountIds: Set<string>,
  expenseCategoryIds: Set<string>,
) {
  for (const [expenseId, expense] of Object.entries(expenses)) {
    if (
      expenseId !== expense.id ||
      !expenseCategoryIds.has(expense.categoryId) ||
      !accountIds.has(expense.accountId)
    ) {
      throw new BackupValidationError();
    }
  }
}

function validateV4BackupIncomesConsistency(
  incomes: V4Backup["incomes"],
  accountIds: Set<string>,
  incomeCategoryIds: Set<string>,
) {
  for (const [incomeId, income] of Object.entries(incomes)) {
    if (
      incomeId !== income.id ||
      !incomeCategoryIds.has(income.categoryId) ||
      !accountIds.has(income.accountId)
    ) {
      throw new BackupValidationError();
    }
  }
}

function validateV4BackupTransfersConsistency(
  transfers: V4Backup["transfers"],
  accountIds: Set<string>,
) {
  for (const [transferId, transfer] of Object.entries(transfers)) {
    if (
      transferId !== transfer.id ||
      !accountIds.has(transfer.fromAccount.accountId) ||
      !accountIds.has(transfer.toAccount.accountId)
    ) {
      throw new BackupValidationError();
    }
  }
}

export function validateV4BackupConsistency(backup: V4Backup): boolean {
  try {
    const currencyIds = validateV4BackupCurrenciesConsistency(
      backup.currencies,
    );
    const accountIds = validateV4BackupAccountsConsistency(
      backup.accounts,
      currencyIds,
    );
    const expenseCategoryIds = validateV4BackupCategoriesConsistency(
      backup.expenseCategories,
    );
    const incomeCategoryIds = validateV4BackupCategoriesConsistency(
      backup.incomeCategories,
    );
    validateV4BackupExpensesConsistency(
      backup.expenses,
      accountIds,
      expenseCategoryIds,
    );
    validateV4BackupIncomesConsistency(
      backup.incomes,
      accountIds,
      incomeCategoryIds,
    );
    validateV4BackupTransfersConsistency(backup.transfers, accountIds);
  } catch (err) {
    if (err instanceof BackupValidationError) {
      return false;
    }
    throw err;
  }
  return true;
}
