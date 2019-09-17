import axios from 'axios';

const getAccountBalance = (): Promise<IAccountBalance> =>
  axios.get('/api/student/account-balance').then(res => res.data);

interface IAccountBalance {
  attributes: IAccountBalanceAttributes;
  id: number;
  links: { self: null };
  type: string;
}

export type IAccountBalanceAttributes = {
  currentBalance: number;
};
// export { getAccountBalance };
export { getAccountBalance };