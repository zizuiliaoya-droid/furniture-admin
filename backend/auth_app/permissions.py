from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """仅允许管理员角色访问"""

    message = "仅管理员可执行此操作"

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )
