export const DRUG_DB_LIMIT = 150;
export const POKEMON_DB_LIMIT = 150;
export const MAX_TOTAL_QUESTIONS = DRUG_DB_LIMIT + POKEMON_DB_LIMIT;

/** 30/70 split with clamping so neither category exceeds DB capacity. */
export function computeClampedDrugCount(totalQuestions: number): number {
  if (totalQuestions < 1 || !Number.isInteger(totalQuestions)) {
    throw new Error("totalQuestions must be a positive integer");
  }

  if (totalQuestions > MAX_TOTAL_QUESTIONS) {
    throw new Error(
      `Cannot request more than ${MAX_TOTAL_QUESTIONS} total questions.`,
    );
  }

  const minThreshold = Math.floor(totalQuestions * 0.3);
  const maxThreshold = Math.ceil(totalQuestions * 0.7);

  const minDrugCount = Math.max(
    minThreshold,
    totalQuestions - POKEMON_DB_LIMIT,
  );
  const maxDrugCount = Math.min(maxThreshold, DRUG_DB_LIMIT);

  if (minDrugCount > maxDrugCount) {
    throw new Error(
      `Cannot generate ${totalQuestions} questions with the available item pool.`,
    );
  }

  return (
    Math.floor(Math.random() * (maxDrugCount - minDrugCount + 1)) + minDrugCount
  );
}

export function computeClampedSplit(totalQuestions: number) {
  const drugCount = computeClampedDrugCount(totalQuestions);
  return { drugCount, pokemonCount: totalQuestions - drugCount };
}
