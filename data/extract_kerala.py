
import geopandas as gpd
from pathlib import Path

# Path to the downloaded GeoJSON file
input_file =input_file = Path(r"C:\Users\Bhavana.S\.gemini\antigravity-ide\scratch\flood-intelligence-system\IND_ADM1.geojson")

# Load the state boundaries
gdf = gpd.read_file(input_file)

# Keep only Kerala
kerala = gdf[gdf["NAME"] == "Kerala"].copy()

if kerala.empty:
    print("Kerala not found. Check the NAME column.")
else:
    # Save Kerala's actual state boundary
    output_file = Path("data") / "kerala_boundary.geojson"
    output_file.parent.mkdir(parents=True, exist_ok=True)

    kerala.to_file(output_file, driver="GeoJSON")
    print(f"Kerala boundary saved to: {output_file}")
