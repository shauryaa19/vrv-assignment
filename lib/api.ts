import { User, Role, PaginatedResponse, Permission, ResourceType, LoginAttempt } from './types'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Simulated in-memory database
let users: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active", lastLogin: "2023-06-15T10:30:00Z", passwordHash: "", twoFactorEnabled: false, lastPasswordChange: "2023-05-01T00:00:00Z" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "Active", lastLogin: "2023-06-14T14:45:00Z", passwordHash: "", twoFactorEnabled: true, lastPasswordChange: "2023-05-15T00:00:00Z" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Viewer", status: "Inactive", lastLogin: "2023-06-10T09:15:00Z", passwordHash: "", twoFactorEnabled: false, lastPasswordChange: "2023-04-20T00:00:00Z" },
]

let roles: Role[] = [
  { id: 1, name: "Admin", permissions: [
    { resource: "Users", actions: ["Create", "Read", "Update", "Delete"] },
    { resource: "Roles", actions: ["Create", "Read", "Update", "Delete"] },
    { resource: "Content", actions: ["Create", "Read", "Update", "Delete"] },
    { resource: "Settings", actions: ["Read", "Update"] },
  ], color: "#FF6B6B" },
  { id: 2, name: "Editor", permissions: [
    { resource: "Content", actions: ["Create", "Read", "Update"] },
    { resource: "Users", actions: ["Read"] },
  ], color: "#4ECDC4" },
  { id: 3, name: "Viewer", permissions: [
    { resource: "Content", actions: ["Read"] },
    { resource: "Users", actions: ["Read"] },
  ], color: "#45B7D1" },
]

let loginAttempts: LoginAttempt[] = []

// Simulated JWT token store
const tokenStore: { [key: string]: { userId: number, expiresAt: number } } = {}

export const api = {
  // User API
  getUsers: async (page: number = 1, pageSize: number = 10, search: string = "", sort: string = "", filter: string = ""): Promise<PaginatedResponse<Omit<User, "passwordHash">>> => {
    await delay(500)
    let filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    )

    if (filter) {
      const [field, value] = filter.split(':')
      filteredUsers = filteredUsers.filter(user => String(user[field as keyof User]).toLowerCase() === value.toLowerCase())
    }

    if (sort) {
      const [field, order] = sort.split(':')
      filteredUsers.sort((a, b) => {
        if (a[field as keyof User] < b[field as keyof User]) return order === 'asc' ? -1 : 1
        if (a[field as keyof User] > b[field as keyof User]) return order === 'asc' ? 1 : -1
        return 0
      })
    }

    const total = filteredUsers.length
    filteredUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)
    
    // Remove passwordHash from the response
    const sanitizedUsers = filteredUsers.map(({ passwordHash, ...user }) => user)
    
    return { data: sanitizedUsers, total, page, pageSize }
  },

  addUser: async (user: Omit<User, 'id' | 'passwordHash'>): Promise<Omit<User, 'passwordHash'>> => {
    await delay(500)
    const newUser = { 
      ...user, 
      id: users.length + 1, 
      lastLogin: new Date().toISOString(),
      passwordHash: await bcrypt.hash(user.password, 10), // Hash the password
      twoFactorEnabled: false,
      lastPasswordChange: new Date().toISOString()
    }
    users.push(newUser)
    const { passwordHash, ...sanitizedUser } = newUser
    return sanitizedUser
  },

  updateUser: async (id: number, updates: Partial<User>): Promise<Omit<User, 'passwordHash'>> => {
    await delay(500)
    const index = users.findIndex(u => u.id === id)
    if (index === -1) throw new Error('User not found')
    
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10)
      updates.lastPasswordChange = new Date().toISOString()
      delete updates.password
    }
    
    users[index] = { ...users[index], ...updates }
    const { passwordHash, ...sanitizedUser } = users[index]
    return sanitizedUser
  },

  deleteUser: async (id: number): Promise<void> => {
    await delay(500)
    users = users.filter(u => u.id !== id)
  },

  // Role API
  getRoles: async (page: number = 1, pageSize: number = 10, search: string = "", sort: string = ""): Promise<PaginatedResponse<Role>> => {
    await delay(500)
    let filteredRoles = roles.filter(role => 
      role.name.toLowerCase().includes(search.toLowerCase())
    )

    if (sort) {
      const [field, order] = sort.split(':')
      filteredRoles.sort((a, b) => {
        if (a[field as keyof Role] < b[field as keyof Role]) return order === 'asc' ? -1 : 1
        if (a[field as keyof Role] > b[field as keyof Role]) return order === 'asc' ? 1 : -1
        return 0
      })
    }

    const total = filteredRoles.length
    filteredRoles = filteredRoles.slice((page - 1) * pageSize, page * pageSize)
    return { data: filteredRoles, total, page, pageSize }
  },

  addRole: async (role: Omit<Role, 'id'>): Promise<Role> => {
    await delay(500)
    const newRole = { ...role, id: roles.length + 1 }
    roles.push(newRole)
    return newRole
  },

  updateRole: async (id: number, updates: Partial<Role>): Promise<Role> => {
    await delay(500)
    const index = roles.findIndex(r => r.id === id)
    if (index === -1) throw new Error('Role not found')
    roles[index] = { ...roles[index], ...updates }
    return roles[index]
  },

  deleteRole: async (id: number): Promise<void> => {
    await delay(500)
    roles = roles.filter(r => r.id !== id)
  },

  // Helper function to get all available resources
  getResources: async (): Promise<ResourceType[]> => {
    await delay(100)
    return ["Users", "Roles", "Content", "Settings"]
  },

  // Authentication
  login: async (email: string, password: string, ipAddress: string): Promise<string | null> => {
    const user = users.find(u => u.email === email)
    if (!user) {
      await logLoginAttempt(0, false, ipAddress)
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      await logLoginAttempt(user.id, false, ipAddress)
      throw new Error('Invalid credentials')
    }

    await logLoginAttempt(user.id, true, ipAddress)

    // Generate and store JWT token
    const token = uuidv4()
    tokenStore[token] = {
      userId: user.id,
      expiresAt: Date.now() + 3600000 // 1 hour expiration
    }

    return token
  },

  logout: async (token: string): Promise<void> => {
    delete tokenStore[token]
  },

  validateToken: async (token: string): Promise<number | null> => {
    const tokenData = tokenStore[token]
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return null
    }
    return tokenData.userId
  }
}

async function logLoginAttempt(userId: number, successful: boolean, ipAddress: string): Promise<void> {
  const attempt: LoginAttempt = {
    userId,
    timestamp: new Date().toISOString(),
    successful,
    ipAddress
  }
  loginAttempts.push(attempt)

  // Implement rate limiting logic here
  const recentAttempts = loginAttempts.filter(a => 
    a.userId === userId && 
    a.successful === false && 
    new Date(a.timestamp).getTime() > Date.now() - 15 * 60 * 1000 // Last 15 minutes
  )

  if (recentAttempts.length >= 5) {
    throw new Error('Too many failed login attempts. Please try again later.')
  }
}

