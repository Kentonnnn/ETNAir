import { jest } from '@jest/globals'

export const prisma = {
  user: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  listing: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  listingImage: {
    createMany: jest.fn().mockResolvedValue({ count: 0 }),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  favorite: {
    findMany:  jest.fn(),
    findUnique: jest.fn(),
    create:    jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  $disconnect: jest.fn().mockResolvedValue(undefined),
}
