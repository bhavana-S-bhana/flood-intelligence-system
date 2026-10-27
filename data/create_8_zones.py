
import json
from pathlib import Path
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

# File paths
DATA_DIR = Path(__file__).parent
INPUT_FILE = DATA_DIR / "Kerala_districts.geojson"
OUTPUT_FILE = DATA_DIR / "kerala_8_zones.geojson"

# Group Kerala's 14 districts into 8 custom zones
ZONE_GROUPS = {
    "Z1": ["Kasaragod"],
    "Z2": ["Kannur"],
    "Z3": ["Wayanad"],
    "Z4": ["Malappuram"],
    "Z5": ["Kozhikode"],
    "Z6": ["Thrissur"],
    "Z7": ["Ernakulam"],
    "Z8": [
        "Kottayam",
        "Alappuzha",
        "Kollam",
        "Thiruvananthapuram",
        "Pathanamthitta",
        "Idukki",
        "Palakkad",
    ],
}


# Normalize district names
def normalize(value):
    result = "".join(
        ch.lower() for ch in str(value)
        if ch.isalnum()
    )

    # KannurDistrict -> kannur
    # KasaragodDistrict -> kasaragod
    if result.endswith("district"):
        result = result[:-8]

    return result


# Load GeoJSON
with INPUT_FILE.open("r", encoding="utf-8") as file:
    source = json.load(file)

features = source.get("features", [])

if not features:
    raise ValueError("No features found in GeoJSON file.")


# Identify the district-name property
possible_keys = (
    "district",
    "district_name",
    "name_2",
    "name",
    "dtname",
)

name_key = None

for key in possible_keys:
    if any(
        key in feature.get("properties", {})
        for feature in features
    ):
        name_key = key
        break

if name_key is None:
    raise ValueError(
        "Could not identify the district-name property."
    )


# Collect only expected districts
expected_names = {
    normalize(name)
    for names in ZONE_GROUPS.values()
    for name in names
}

districts = {}

for feature in features:
    properties = feature.get("properties", {})
    name = normalize(properties.get(name_key, ""))

    if name not in expected_names:
        continue

    geometry = feature.get("geometry")

    if not geometry:
        continue

    geom = shape(geometry)

    if geom.is_empty:
        continue

    # Ignore point and line features
    if geom.geom_type not in ("Polygon", "MultiPolygon"):
        continue

    # Combine duplicate geometries for the same district
    if name in districts:
        districts[name].append(geom)
    else:
        districts[name] = [geom]


# Create 8 zone geometries
output_features = []

for zone_id, district_names in ZONE_GROUPS.items():
    selected = []

    for district_name in district_names:
        key = normalize(district_name)

        if key not in districts:
            raise ValueError(
                f"District '{district_name}' not found. "
                f"Available districts: {list(districts.keys())}"
            )

        selected.extend(districts[key])

    merged_geometry = unary_union(selected)

    output_features.append({
        "type": "Feature",
        "properties": {
            "zone_id": zone_id,
            "zone_name": zone_id,
            "districts": district_names,
        },
        "geometry": mapping(merged_geometry),
    })

    print(
        f"{zone_id}: {', '.join(district_names)}"
    )


# Save output GeoJSON
output = {
    "type": "FeatureCollection",
    "features": output_features,
}

with OUTPUT_FILE.open("w", encoding="utf-8") as file:
    json.dump(output, file, indent=2)


print("\nKerala 8-zone GeoJSON created successfully!")
print(f"Saved to: {OUTPUT_FILE}")
print(f"Total zones: {len(output_features)}")
