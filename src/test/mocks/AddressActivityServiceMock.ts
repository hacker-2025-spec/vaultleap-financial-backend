import type { AddressActivityService } from '../../address-activity/address-activity.service'

type AddressActivityServiceMock = Record<keyof AddressActivityService, jest.Mock>

export const AddressActivityServiceMock = {
  create: jest.fn(),
  init: jest.fn(),
  // eslint-disable-next-line no-promise-executor-return
  initialized: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(true))),
  find: jest.fn(),
} satisfies Partial<AddressActivityServiceMock>
