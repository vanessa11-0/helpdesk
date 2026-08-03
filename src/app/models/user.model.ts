  export enum UserRole {
    CLIENT = 'CLIENT',
      AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

  export interface User {
    id: string
    email: string
    fullName: string
    role: UserRole
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}


