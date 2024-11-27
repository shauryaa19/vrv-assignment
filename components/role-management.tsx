"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Role, Permission, ResourceType } from "@/lib/types"
import { Pagination } from "@/components/ui/pagination"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, Plus, Edit, Trash2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [newRole, setNewRole] = useState({ name: "", permissions: [] as Permission[], color: "#000000" })
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("")
  const [resources, setResources] = useState<ResourceType[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchRoles()
    fetchResources()
  }, [page, search, sort])

  const fetchRoles = async () => {
    try {
      const response = await api.getRoles(page, pageSize, search, sort)
      setRoles(response.data)
      setTotal(response.total)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      })
    }
  }

  const fetchResources = async () => {
    try {
      const fetchedResources = await api.getResources()
      setResources(fetchedResources)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch resources",
        variant: "destructive",
      })
    }
  }

  const addRole = async () => {
    if (newRole.name) {
      try {
        await api.addRole(newRole)
        setNewRole({ name: "", permissions: [], color: "#000000" })
        fetchRoles()
        toast({
          title: "Success",
          description: "Role added successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add role",
          variant: "destructive",
        })
      }
    }
  }

  const updateRole = async (id: number, updates: Partial<Role>) => {
    try {
      await api.updateRole(id, updates)
      fetchRoles()
      toast({
        title: "Success",
        description: "Role updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      })
    }
  }

  const deleteRole = async (id: number) => {
    try {
      await api.deleteRole(id)
      fetchRoles()
      toast({
        title: "Success",
        description: "Role deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      })
    }
  }

  const togglePermission = (role: Role, resource: ResourceType, action: string) => {
    const updatedPermissions = role.permissions.map(p => {
      if (p.resource === resource) {
        if (p.actions.includes(action as any)) {
          return { ...p, actions: p.actions.filter(a => a !== action) }
        } else {
          return { ...p, actions: [...p.actions, action as any] }
        }
      }
      return p
    })
    if (!updatedPermissions.some(p => p.resource === resource)) {
      updatedPermissions.push({ resource, actions: [action as any] })
    }
    updateRole(role.id, { permissions: updatedPermissions })
  }

  const handleSort = (field: string) => {
    const newSort = sort === `${field}:asc` ? `${field}:desc` : `${field}:asc`
    setSort(newSort)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sort.startsWith(field)) {
      return sort.endsWith('asc') ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-[300px]"
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add New Role</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
              <DialogDescription>Enter the details of the new role here.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={newRole.color}
                  onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addRole}>Add Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <Badge style={{backgroundColor: role.color}}>
                  {role.name}
                </Badge>
                <div>
                  <Button variant="ghost" size="sm" className="mr-2" onClick={() => setEditingRole(role)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteRole(role.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {resources.map(resource => (
                  <AccordionItem value={resource} key={resource}>
                    <AccordionTrigger>{resource}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2">
                        {["Create", "Read", "Update", "Delete"].map(action => (
                          <label key={action} className="flex items-center space-x-2">
                            <Checkbox
                              checked={role.permissions.some(p => p.resource === resource && p.actions.includes(action as any))}
                              onCheckedChange={() => togglePermission(role, resource, action)}
                            />
                            <span>{action}</span>
                          </label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
      <Pagination
        total={total}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
      />
      <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Make changes to the role here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {editingRole && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input
                  id="edit-name"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-color" className="text-right">Color</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={editingRole.color}
                  onChange={(e) => setEditingRole({ ...editingRole, color: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => {
              if (editingRole) {
                updateRole(editingRole.id, { name: editingRole.name, color: editingRole.color })
                setEditingRole(null)
              }
            }}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

