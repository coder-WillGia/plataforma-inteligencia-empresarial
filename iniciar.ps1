# Script de inicio automático - Plataforma de Inteligencia Empresarial
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  PLATAFORMA DE INTELIGENCIA EMPRESARIAL - INICIO RAPIDO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$tieneRoot = Test-Path (Join-Path $PSScriptRoot "node_modules")
$tieneBackend = Test-Path (Join-Path $PSScriptRoot "apps\backend\node_modules")
$tieneFrontend = Test-Path (Join-Path $PSScriptRoot "apps\frontend\node_modules")

if (-not ($tieneRoot -and $tieneBackend -and $tieneFrontend)) {
    Write-Host "[!] Dependencias no detectadas. Ejecutando 'pnpm install'..." -ForegroundColor Yellow
    pnpm install
    Write-Host "[OK] Dependencias instaladas correctamente." -ForegroundColor Green
} else {
    Write-Host "[OK] Dependencias ya instaladas. Iniciando servidores..." -ForegroundColor Green
}

pnpm run dev
