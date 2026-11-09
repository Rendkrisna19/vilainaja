#!/usr/bin/env bash
# Cek semua URL images.unsplash.com di sebuah file; exit 1 bila ada yang tidak HTTP 200.
# Pemakaian: bash check-images.sh index.html
set -u
file="${1:-index.html}"
[ -f "$file" ] || { echo "File tidak ditemukan: $file"; exit 2; }

fail=0
# ambil ID unik dari pola photo-<ID>
ids=$(grep -oE 'images\.unsplash\.com/photo-[A-Za-z0-9_-]+' "$file" | sed 's#.*/photo-##' | sort -u)
[ -z "$ids" ] && { echo "Tidak ada URL Unsplash di $file"; exit 0; }

for id in $ids; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -L "https://images.unsplash.com/photo-${id}?w=200&q=40")
  if [ "$code" = "200" ]; then echo "200  $id"; else echo "FAIL $code $id"; fail=1; fi
done
exit $fail
