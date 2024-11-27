export type ResourceType = "Users" | "Roles" | "Content" | "Settings"

export type Permission = {
  resource: ResourceType
  actions: ("Create" | "Read" | "Update" | "Delete")[]
}

export type User = {
  id: number
  name: string
  email: string
  role: string
  status: "Active" | "Inactive"
  lastLogin?: string
  passwordHash: string // Store hashed password, not plain text
  twoFactorEnabled: boolean
  lastPasswordChange: string
}

export type Role = {
  id: number
  name: string
  permissions: Permission[]
  color: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export type LoginAttempt = {
  userId: number
  timestamp: string
  successful: boolean
  ipAddress: string
}

