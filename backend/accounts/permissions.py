"""
Custom permission classes for role-based access control
"""
from rest_framework import permissions


class IsAuthority(permissions.BasePermission):
    """
    Permission class that only allows authority users
    """
    message = "Only authority users can access this resource"
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'authority'
        )


class IsAuthorityOrAdmin(permissions.BasePermission):
    """
    Permission class that allows authority or admin users
    """
    message = "Only authority or admin users can access this resource"
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['authority', 'admin']
        )


class IsAdmin(permissions.BasePermission):
    """
    Permission class that only allows admin users
    """
    message = "Only admin users can access this resource"
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user or request.user.role in ['admin', 'authority']
