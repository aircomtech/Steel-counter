#!/usr/bin/env bash
set -euo pipefail

images=(
  automaticsaw.jpg
  boiler-house.jpg
  car-showroom.jpg
  cold-storage.jpg
  decking-installation.jpeg
  facilities.jpg
  feed-mill.jpg
  hbeam.jpg
  hmda-truck-dock-logistics-township.jpeg
  logistics-ware-house.jpg
  multi-level-steel-frame-01.jpeg
  multitorch.jpg
  netra-furniture-mall.jpeg
  new-project-blue-facility.jpeg
  new-project-dark-facility.jpeg
  new-project-green-facility.jpeg
  new-project-herbochem.png
  new-project-multilevel-frame.jpeg
  new-project-roofing-progress.jpeg
  new-project-steel-frame.jpeg
  project-industrial-complex-aerial.jpeg
  project-multistorey-facility.jpeg
  project-preengineered-warehouse.jpeg
  project-process-plant.jpeg
  project-progress-aerial.jpeg
  refinery.jpg
  steel-erection-aerial-02.jpeg
  steel-rolling-mill.jpg
  steel-structure-erection.jpeg
  warehouse-cluster.jpeg
  warehouse-interior-racking.jpeg
)

for image in "${images[@]}"; do
  path="public/$image"
  read -r width height < <(identify -format '%w %h\n' "$path")
  short_side=$(( width < height ? width : height ))
  point_size=$(( short_side / 13 ))
  (( point_size < 28 )) && point_size=28
  vertical_offset=$(( height / 3 ))
  temp_path="${path%.*}.watermarked.${path##*.}"

  convert "$path" \
    -gravity center \
    -font DejaVu-Sans-Bold \
    -pointsize "$point_size" \
    -fill 'rgba(255,255,255,0.34)' \
    -stroke 'rgba(0,0,0,0.28)' \
    -strokewidth 1 \
    -annotate '24x24+0+0' 'CONTOUR' \
    -annotate "24x24+0+$vertical_offset" 'CONTOUR' \
    -annotate "24x24+0-$vertical_offset" 'CONTOUR' \
    -quality 94 \
    "$temp_path"

  mv "$temp_path" "$path"
done
