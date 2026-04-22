from django.db import migrations


CATEGORY_DATA = {
    "TYPE": {
        "Seating（坐具类）": [
            "Office Chair（办公椅）",
            "Guest Chair（访客椅）",
            "Conference Chairs（会议椅）",
            "Stools（凳子）",
            "Lounge Seating（休闲坐具）",
            "Visitor Seating（接待椅）",
            "Operator Seating（职员椅）",
        ],
        "Desks + Workstations（工位办公桌类）": [
            "Desks（办公桌）",
            "Height-Adjustable Desks（升降桌）",
            "Benching（屏风工位）",
            "Private Offices（独立办公室办公桌）",
        ],
        "Table（桌台类）": [
            "Conference + Collaborative Tables（会议/协作桌）",
            "Occasional Tables（休闲桌）",
            "Outdoor Tables + Shade（户外桌及遮阳设施）",
        ],
        "Storage（收纳储物类）": [
            "Workstation Storage（工位收纳）",
            "Lockers（储物柜）",
            "Cabinets + Credenzas（文件柜/矮柜）",
            "Bookcases + Shelving（书柜/置物架）",
            "Carts（移动推车）",
        ],
        "Accessories（配套附件类）": [
            "Modular Walls + Sound Masking（模块化隔断及隔音材料）",
            "Pods（独立pods单元）",
            "Freestanding Screens（独立屏风）",
            "Architecture + Space Division（建筑/空间分割件）",
            "Monitor Arms Desks（显示器支架及配件）",
            "Power / Cable Management（电源/线缆管理）",
            "Lighting（照明设备）",
            "Tables（附属桌台配件）",
        ],
        "Education（教育家具类）": [
            "Classroom Chairs（教室椅）",
            "Education Lounge（教育休闲家具）",
            "Seating（教育类坐具）",
            "Classroom Storage（教室收纳）",
            "Education Desks + Workstations（教育类工位桌）",
            "Accessories（教育类附件）",
        ],
    },
    "BRAND": {
        "ZIKOO 自有品牌": [
            "ZIKOO 全系列产品",
        ],
        "国际品牌": [
            "Steelcase（世楷）",
            "Vitra（维特拉）",
        ],
    },
}


def seed_categories(apps, schema_editor):
    Category = apps.get_model("products", "Category")

    # Remove old SPACE/ORIGIN dimension categories
    Category.objects.filter(dimension__in=["SPACE", "ORIGIN"]).delete()

    for dimension, level1_dict in CATEGORY_DATA.items():
        for sort1, (parent_name, children) in enumerate(level1_dict.items()):
            parent, _ = Category.objects.get_or_create(
                name=parent_name,
                dimension=dimension,
                parent=None,
                defaults={"sort_order": sort1},
            )
            for sort2, child_name in enumerate(children):
                Category.objects.get_or_create(
                    name=child_name,
                    dimension=dimension,
                    parent=parent,
                    defaults={"sort_order": sort2},
                )


def reverse_seed(apps, schema_editor):
    Category = apps.get_model("products", "Category")
    for dimension, level1_dict in CATEGORY_DATA.items():
        for parent_name in level1_dict:
            Category.objects.filter(name=parent_name, dimension=dimension).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_categories, reverse_seed),
    ]
