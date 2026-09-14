import type { Pet } from './pet'

export type { Pet }

export interface Owner {
  id: number,
  firstName: string,
  lastName: string,
  telephone: string,
  address: string,
  city: string,
  pets: Pet[],
}
