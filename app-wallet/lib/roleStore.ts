export type Role = 'tourist' | 'partner' | 'admin'

let _role: Role = 'tourist'

export const getRole = () => _role
export const setRole = (r: Role) => {
  _role = r
}
