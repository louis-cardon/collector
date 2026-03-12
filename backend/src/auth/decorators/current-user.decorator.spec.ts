import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Role } from '@prisma/client';
import { CurrentUser } from './current-user.decorator';

type CurrentUserFactory = (
  data: unknown,
  context: ExecutionContext,
) => {
  id: string;
  email: string;
  role: Role;
};

describe('CurrentUser decorator', () => {
  it('returns authenticated user from request context', () => {
    const expectedUser = {
      id: 'admin-id',
      email: 'admin@collector.local',
      role: Role.admin,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: expectedUser,
        }),
      }),
    } as unknown as ExecutionContext;

    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getMe(@CurrentUser() _user: unknown): void {}
    }

    const argsMetadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'getMe',
    ) as Record<string, { factory: CurrentUserFactory }>;
    const firstParamMetadata = Object.values(argsMetadata)[0];

    expect(firstParamMetadata).toBeDefined();
    if (!firstParamMetadata) {
      throw new Error('Expected CurrentUser metadata to be defined');
    }

    expect(firstParamMetadata.factory(undefined, context)).toEqual(
      expectedUser,
    );
  });
});
