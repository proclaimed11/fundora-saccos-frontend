import { useRoles } from '../administration/roles/rolesContext'

// what the signed-in role may do on one page, for example usePageAccess('loans', 'contracts')
export function usePageAccess(area: string, page?: string) {
  const { can } = useRoles()
  return {
    canView: can(area, 'view', page),
    canCreate: can(area, 'create', page),
    canEdit: can(area, 'edit', page),
    canDelete: can(area, 'delete', page),
    canApprove: can(area, 'approve', page),
  }
}