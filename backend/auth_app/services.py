from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from .models import User


class AuthService:
    @staticmethod
    def login(username: str, password: str) -> dict:
        user = User.objects.filter(username=username).first()
        if not user:
            raise ValueError("用户名或密码错误")
        if not user.is_active:
            raise ValueError("账号已被禁用")

        user = authenticate(username=username, password=password)
        if not user:
            raise ValueError("用户名或密码错误")

        token, _ = Token.objects.get_or_create(user=user)
        return {"token": token.key, "user": user}

    @staticmethod
    def logout(user: User) -> None:
        Token.objects.filter(user=user).delete()

    @staticmethod
    def toggle_status(user_id: int, current_user: User) -> User:
        user = User.objects.get(pk=user_id)
        if user.pk == current_user.pk:
            raise ValueError("不能禁用自己的账号")

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])

        if not user.is_active:
            Token.objects.filter(user=user).delete()

        return user
