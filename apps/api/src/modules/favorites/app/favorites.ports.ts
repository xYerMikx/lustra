export type FavoriteStore = {
  add(userId: string, masterId: string): Promise<void>
  remove(userId: string, masterId: string): Promise<void>
  has(userId: string, masterId: string): Promise<boolean>
  listMasterIds(userId: string): Promise<string[]>
}
