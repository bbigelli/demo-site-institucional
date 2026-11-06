# Empacota o child-theme como ZIP instalavel pelo painel do WordPress.
#
#   powershell -ExecutionPolicy Bypass -File build\pack-theme.ps1
#
# Saida: dist\treino-casa-30.zip
#
# Por que nao usar Compress-Archive: no PowerShell 5.1 ele grava os caminhos
# internos do ZIP com barra invertida, que a especificacao do formato nao
# permite. O ZipArchive do .NET Framework faz o mesmo. Resultado: o PHP
# extrai "treino-casa-30\style.css" como UM arquivo de nome estranho, em vez
# da pasta com o arquivo dentro, e o WordPress recusa o tema.
# Por isso as entradas sao criadas uma a uma, com o nome normalizado.

$ErrorActionPreference = 'Stop'

$repo      = Split-Path -Parent $PSScriptRoot
$themeName = 'clinica-movimento'
$source    = Join-Path $repo 'child-theme'
$distDir   = Join-Path $repo 'dist'
$zipPath   = Join-Path $distDir "$themeName.zip"

if (-not (Test-Path $source)) {
    throw "Pasta child-theme nao encontrada em: $source"
}

New-Item -ItemType Directory -Force -Path $distDir | Out-Null

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$back = [char]92
$fwd  = [char]47

$stream  = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
$archive = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create)

$count = 0
Get-ChildItem -Path $source -Recurse -File | ForEach-Object {
    $relative  = $_.FullName.Substring($source.Length).TrimStart($back)
    $entryName = $themeName + $fwd + $relative.Replace($back, $fwd)

    $entry  = $archive.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
    $writer = $entry.Open()
    $bytes  = [System.IO.File]::ReadAllBytes($_.FullName)
    $writer.Write($bytes, 0, $bytes.Length)
    $writer.Close()

    $count++
}

$archive.Dispose()
$stream.Close()

# Verifica o que foi gravado antes de declarar sucesso.
$entries = [System.IO.Compression.ZipFile]::OpenRead($zipPath).Entries
$invalid = ($entries | Where-Object { $_.FullName.Contains($back) }).Count

Write-Output "ZIP: $zipPath"
Write-Output "Arquivos: $count"
$entries | ForEach-Object { Write-Output ("  " + $_.FullName) }

if ($invalid -gt 0) {
    throw "$invalid entradas com separador invalido -- o WordPress recusaria este ZIP."
}

Write-Output 'OK: separadores corretos.'
