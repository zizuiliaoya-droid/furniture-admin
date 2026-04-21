import os


def create_admin():
    from auth_app.models import User

    username = os.environ.get("ADMIN_USERNAME", "admin")
    password = os.environ.get("ADMIN_PASSWORD", "admin123456")

    if User.objects.filter(username=username).exists():
        print(f"Admin user '{username}' already exists, skipping.")
        return

    User.objects.create_superuser(
        username=username,
        password=password,
        role="ADMIN",
        display_name="系统管理员",
    )
    print(f"Admin user '{username}' created successfully.")
