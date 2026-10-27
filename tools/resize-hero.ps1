# Builds larger copies (2600 px on the long side) of the photos that are shown big: every photo in the
# homepage hero pools (HOME.slides in js\content.js) and the rates teaser photo (HOME.ratesPhoto).
# The normal 2000 px files look soft there on retina laptops. Never enlarges past the original.
# Run from PowerShell:  powershell -ExecutionPolicy Bypass -File tools\resize-hero.ps1
param([string]$src = "C:\Users\tshed\Pictures\INF JPG\Website Commits")
Add-Type -AssemblyName System.Drawing
$repo = Split-Path $PSScriptRoot -Parent
$out = Join-Path $repo "assets\hero"
New-Item -ItemType Directory -Force -Path $out | Out-Null
Get-ChildItem $out -File | Remove-Item

# Photo ids from the hero pools and the rates teaser
$content = Get-Content (Join-Path $repo "js\content.js") -Raw
$slidesBlock = [regex]::Match($content, "slides:\s*\[([\s\S]*?)\n\s*\],").Groups[1].Value
$ids = [regex]::Matches($slidesBlock, '"([a-z]+-\d+)"') | ForEach-Object { $_.Groups[1].Value }
$rates = [regex]::Match($content, 'ratesPhoto:\s*"([a-z]+-\d+)"').Groups[1].Value
$ids = @($ids) + $rates | Select-Object -Unique

$srcOf = @{}; foreach ($r in (Import-Csv (Join-Path $PSScriptRoot "photos.csv"))) { $srcOf[$r.id] = $r.src }
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$log = @("id,width,height")
foreach ($id in $ids) {
  $img = [System.Drawing.Image]::FromFile((Join-Path $src $srcOf[$id]))
  if ($img.PropertyIdList -contains 0x0112) {
    switch ($img.GetPropertyItem(0x0112).Value[0]) { 3 {$img.RotateFlip('Rotate180FlipNone')} 6 {$img.RotateFlip('Rotate90FlipNone')} 8 {$img.RotateFlip('Rotate270FlipNone')} }
  }
  $s = [math]::Min(1.0, 2600 / [math]::Max($img.Width, $img.Height))
  $w = [int][math]::Round($img.Width*$s); $h = [int][math]::Round($img.Height*$s)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'HighQuality'; $g.PixelOffsetMode = 'HighQuality'; $g.CompositingQuality = 'HighQuality'
  $g.DrawImage($img, 0, 0, $w, $h)
  $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]80)
  $bmp.Save((Join-Path $out "$id.jpg"), $codec, $ep)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  $log += "$id,$w,$h"
}
$log | Set-Content (Join-Path $PSScriptRoot "hero-manifest.csv") -Encoding UTF8
"$($ids.Count) hero photos written to assets\hero"
