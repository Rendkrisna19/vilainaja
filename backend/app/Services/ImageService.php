<?php

namespace App\Services;

use App\Exceptions\BookingException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Memproses foto kamar: diperkecil, dikonversi ke WebP, dan disimpan di public/uploads.
 * Versi utama (maks. 1600 px) untuk halaman booking, versi kecil (maks. 640 px) untuk kartu & galeri.
 * Jika server tidak mendukung WebP, otomatis memakai JPEG.
 */
class ImageService
{
    public const MAX_FULL = 1600;
    public const MAX_THUMB = 640;
    public const MAX_SOURCE_PIXELS = 40_000_000; // mencegah gambar raksasa menghabiskan memori

    /** @return array{path:string,thumb_path:string,width:int,height:int,bytes:int} */
    public function storeRoomImage(UploadedFile $file, int $roomId): array
    {
        $raw = file_get_contents($file->getRealPath());
        $src = @imagecreatefromstring($raw);

        if ($src === false) {
            throw new BookingException('File bukan gambar yang valid.', 422);
        }

        $srcW = imagesx($src);
        $srcH = imagesy($src);
        if ($srcW * $srcH > self::MAX_SOURCE_PIXELS) {
            imagedestroy($src);
            throw new BookingException('Resolusi gambar terlalu besar. Maksimal sekitar 6000 × 6000 px.', 422);
        }

        $useWebp = function_exists('imagewebp');
        $ext = $useWebp ? 'webp' : 'jpg';
        $dir = public_path("uploads/rooms/{$roomId}");
        File::ensureDirectoryExists($dir);

        $base = Str::uuid()->toString();
        $full = $this->scale($src, self::MAX_FULL);
        $thumb = $this->scale($src, self::MAX_THUMB);

        $fullPath = "{$dir}/{$base}.{$ext}";
        $thumbPath = "{$dir}/{$base}-thumb.{$ext}";

        $this->save($full, $fullPath, $useWebp, 82);
        $this->save($thumb, $thumbPath, $useWebp, 78);

        $width = imagesx($full);
        $height = imagesy($full);
        $bytes = filesize($fullPath);

        imagedestroy($full);
        imagedestroy($thumb);
        imagedestroy($src);

        $rel = fn (string $p) => 'uploads/rooms/'.$roomId.'/'.basename($p);

        return [
            'path' => $rel($fullPath),
            'thumb_path' => $rel($thumbPath),
            'width' => $width,
            'height' => $height,
            'bytes' => $bytes,
        ];
    }

    public function deleteFiles(string $relativePath, string $thumbRelativePath): void
    {
        foreach ([$relativePath, $thumbRelativePath] as $p) {
            $abs = public_path($p);
            if ($p && is_file($abs)) {
                @unlink($abs);
            }
        }
    }

    /** Perkecil proporsional; gambar yang sudah lebih kecil tidak diperbesar. */
    private function scale($src, int $maxWidth)
    {
        $w = imagesx($src);
        $h = imagesy($src);

        if ($w <= $maxWidth) {
            $nw = $w;
            $nh = $h;
        } else {
            $nw = $maxWidth;
            $nh = (int) round($h * ($maxWidth / $w));
        }

        $dst = imagecreatetruecolor($nw, $nh);
        // Latar putih untuk gambar PNG transparan saat dikonversi ke JPEG.
        imagefill($dst, 0, 0, imagecolorallocate($dst, 255, 255, 255));
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);

        return $dst;
    }

    private function save($img, string $path, bool $webp, int $quality): void
    {
        $ok = $webp ? imagewebp($img, $path, $quality) : imagejpeg($img, $path, $quality);

        if (! $ok) {
            throw new BookingException('Gagal menyimpan gambar. Coba lagi.', 500);
        }
    }
}
