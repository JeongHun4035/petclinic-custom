export interface Vet {
  id: number,
  firstName: string,
  lastName: string,
  specialties: {
    id: number,
    name: string,
  }[],
}
