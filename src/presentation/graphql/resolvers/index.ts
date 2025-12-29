import { dateTimeScalar } from './scalars';
import { queries } from './queries';
import { mutations } from './mutations';
import { expenseTypes } from './types/expenseTypes';

export const resolvers: any = {
  DateTime: dateTimeScalar,
  Query: queries,
  Mutation: mutations,
  ...expenseTypes,
};
