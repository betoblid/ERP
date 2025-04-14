"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { FiPlus, FiEdit, FiTrash2, FiCheck } from "react-icons/fi"
import api from "@/lib/api"
import type { User, Funcionario } from "@/@types"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "usuario",
    funcionarioId: "",
    password: "",
  })

  useEffect(() => {
    Promise.all([api.get<User[]>("/usuarios"), api.get<Funcionario[]>("/funcionario")])
      .then(([usuariosRes, funcionariosRes]) => {
        setUsuarios(usuariosRes.data)
        setFuncionarios(funcionariosRes.data)
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
        toast.error("Erro ao carregar dados")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      funcionarioId: user.funcionarioId?.toString() || "",
      password: "",
    })
    setIsModalOpen(true)
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setFormData({
      username: "",
      email: "",
      role: "usuario",
      funcionarioId: "",
      password: "",
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedUser) {
        // Update user
        await api.put(`/usuarios/${selectedUser.id}`, {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          funcionarioId: formData.funcionarioId ? Number(formData.funcionarioId) : null,
        })
        toast.success("Usuário atualizado com sucesso!")
      } else {
        // Create user
        await api.post("/register", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          funcionarioId: formData.funcionarioId ? Number(formData.funcionarioId) : null,
        })
        toast.success("Usuário criado com sucesso!")
      }

      // Refresh users list
      const response = await api.get<User[]>("/usuarios")
      setUsuarios(response.data)
      setIsModalOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar usuário")
    }
  }

  const toggleUserStatus = async (user: User) => {
    try {
      if (user.ativo) {
        await api.delete(`/usuarios/${user.id}`)
        toast.success("Usuário desativado com sucesso!")
      } else {
        await api.put(`/usuarios/${user.id}/reactivate`)
        toast.success("Usuário reativado com sucesso!")
      }

      // Refresh users list
      const response = await api.get<User[]>("/usuarios")
      setUsuarios(response.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao alterar status do usuário")
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "badge-danger"
      case "gerente":
        return "badge-warning"
      default:
        return "badge-info"
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "gerente":
        return "Gerente"
      default:
        return "Usuário"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
        <button onClick={handleAddUser} className="btn btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Novo Usuário
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Usuário</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Permissão</th>
                <th className="table-header-cell">Funcionário</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Ações</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="table-row">
                    <td className="table-cell font-medium text-gray-900">{usuario.username}</td>
                    <td className="table-cell">{usuario.email}</td>
                    <td className="table-cell">
                      <span className={`badge ${getRoleBadgeClass(usuario.role)}`}>{getRoleName(usuario.role)}</span>
                    </td>
                    <td className="table-cell">{usuario.funcionario ? usuario.funcionario.nome : "Não vinculado"}</td>
                    <td className="table-cell">
                      <span className={`badge ${usuario.ativo ? "badge-success" : "badge-danger"}`}>
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(usuario)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(usuario)}
                          className={`${
                            usuario.ativo ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"
                          }`}
                          title={usuario.ativo ? "Desativar" : "Ativar"}
                        >
                          {usuario.ativo ? <FiTrash2 /> : <FiCheck />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl text-gray-800 font-bold mb-4">{selectedUser ? "Editar Usuário" : "Novo Usuário"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <Label htmlFor="username" className="form-label">
                  Nome de Usuário
                </Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  className="text-gray-700 form-input"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <Label htmlFor="email" className="form-label">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                   className="text-gray-700 form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {!selectedUser && (
                <div className="form-group">
                  <Label htmlFor="password" className="form-label">
                    Senha
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                     className="text-gray-700 form-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!selectedUser}
                    minLength={6}
                  />
                </div>
              )}

              <div className="form-group">
                <Label htmlFor="role" className="form-label">
                  Permissão
                </Label>
                <select
                  id="role"
                  name="role"
                  className="form-select text-gray-800"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="usuario">Usuário</option>
                  <option value="gerente">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="form-group">
                <Label htmlFor="funcionarioId" className="form-label">
                  Funcionário
                </Label>
                <select
                  id="funcionarioId"
                  name="funcionarioId"
                  className="form-select text-gray-800"
                  value={formData.funcionarioId}
                  onChange={handleInputChange}
                >
                  <option value="">Nenhum</option>
                  {funcionarios.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome} ({funcionario.cargo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end mt-6 space-x-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

