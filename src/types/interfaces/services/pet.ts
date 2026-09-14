export interface Pet {
  id: number,
  name: string,
  birthDate: string,
  type: {
    id: number,
    name: string,
  },
  ownerId: number,
  visits: unknown[],
}
