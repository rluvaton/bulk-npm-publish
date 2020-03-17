import {UserOptions} from './user-options';

export type IUserOptionGetter = () => Promise<UserOptions>;
