import {UserOptions} from './user-options';

export interface IUserOptionGetter {
  get(): Promise<UserOptions>;
}
