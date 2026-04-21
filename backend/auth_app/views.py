from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import User
from .permissions import IsAdminRole
from .serializers import (
    LoginSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from .services import AuthService


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        result = AuthService.login(**serializer.validated_data)
        return Response({
            "token": result["token"],
            "user": UserSerializer(result["user"]).data,
        })
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    AuthService.logout(request.user)
    return Response({"detail": "已登出"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


class UserViewSet(ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        if self.action in ("update", "partial_update"):
            return UserUpdateSerializer
        return UserSerializer

    @action(detail=True, methods=["post"], url_path="toggle-status")
    def toggle_status(self, request, pk=None):
        try:
            user = AuthService.toggle_status(pk, request.user)
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
            return Response(
                {"detail": "用户不存在"}, status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
