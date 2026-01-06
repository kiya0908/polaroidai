import { z } from 'zod'

import { Hashids } from '@/lib/hashid'

// 延迟初始化，避免构建时访问环境变量
let _accountHashids: ReturnType<typeof Hashids> | null = null;
export const AccountHashids = {
  encode: (id: number | bigint) => {
    if (!_accountHashids) {
      _accountHashids = Hashids('AccountInfo');
    }
    return _accountHashids.encode(Number(id));
  },
  decode: (hash: string) => {
    if (!_accountHashids) {
      _accountHashids = Hashids('AccountInfo');
    }
    return _accountHashids.decode(hash);
  },
};
