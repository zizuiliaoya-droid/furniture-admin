from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import ShareLink
from .serializers import ShareLinkSerializer, ShareLinkCreateSerializer, SharePublicSerializer
from .services import ShareService


class ShareLinkViewSet(ModelViewSet):
    queryset = ShareLink.objects.all()
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "delete"]

    def get_serializer_class(self):
        if self.action == "create":
            return ShareLinkCreateSerializer
        return ShareLinkSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def share_public_view(request, token):
    try:
        share = ShareLink.objects.get(token=token)
    except ShareLink.DoesNotExist:
        return Response({"detail": "分享链接不存在"}, status=404)

    error = ShareService.validate_access(share)
    if error:
        return Response({"detail": error}, status=403)

    return Response(SharePublicSerializer(share).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def share_verify_view(request, token):
    try:
        share = ShareLink.objects.get(token=token)
    except ShareLink.DoesNotExist:
        return Response({"detail": "分享链接不存在"}, status=404)

    error = ShareService.validate_access(share)
    if error:
        return Response({"detail": error}, status=403)

    password = request.data.get("password", "")
    if not share.check_password(password):
        return Response({"detail": "密码错误"}, status=403)

    ShareService.log_access(share, request)
    content = ShareService.get_shared_content(share)
    return Response(content)
