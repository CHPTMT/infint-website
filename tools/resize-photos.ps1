# Rebuilds assets/thumbs and assets/photos from the original JPEGs.
# Run from PowerShell:  powershell -ExecutionPolicy Bypass -File tools\resize-photos.ps1
# tools\photos.csv lists every photo: its site id and its path inside $src.
# Writes tools\photos-manifest.csv with the final pixel sizes (used for "r" in js\content.js).
param([string]$src = "C:\Users\tshed\Pictures\INF JPG\Website Commits")
Add-Type -AssemblyName System.Drawing
$repo = Split-Path $PSScriptRoot -Parent
$thumbs = Join-Path $repo "assets\thumbs"; $photos = Join-Path $repo "assets\photos"
New-Item -ItemType Directory -Force -Path $thumbs,$photos | Out-Null
Get-ChildItem $thumbs -File | Remove-Item
Get-ChildItem $photos -File | Where-Object { $_.Name -ne "about-tshedza.jpg" } | Remove-Item
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
function Save-Resized($img, $long, $path, $q){
  $s = [math]::Min(1.0, $long / [math]::Max($img.Width, $img.Height))
  $w = [int][math]::Round($img.Width*$s); $h = [int][math]::Round($img.Height*$s)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'HighQuality'; $g.PixelOffsetMode = 'HighQuality'; $g.CompositingQuality = 'HighQuality'
  $g.DrawImage($img, 0, 0, $w, $h)
  $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$q)
  $bmp.Save($path, $codec, $ep)
  $g.Dispose(); $bmp.Dispose()
  return "$w,$h"
}
$log = @("id,src,width,height")
foreach ($r in (Import-Csv (Join-Path $PSScriptRoot "photos.csv"))) {
  $img = [System.Drawing.Image]::FromFile((Join-Path $src $r.src))
  if ($img.PropertyIdList -contains 0x0112) {
    switch ($img.GetPropertyItem(0x0112).Value[0]) { 3 {$img.RotateFlip('Rotate180FlipNone')} 6 {$img.RotateFlip('Rotate90FlipNone')} 8 {$img.RotateFlip('Rotate270FlipNone')} }
  }
  $d = Save-Resized $img 2000 (Join-Path $photos "$($r.id).jpg") 84
  $null = Save-Resized $img 720 (Join-Path $thumbs "$($r.id).jpg") 80
  $img.Dispose()
  $log += "$($r.id),$($r.src),$d"
}
$log | Set-Content (Join-Path $PSScriptRoot "photos-manifest.csv") -Encoding UTF8
"done" | Set-Content (Join-Path $PSScriptRoot "resize.done")
