Write-Host "Aplicando correcciones automáticas con Biome Linter..." -ForegroundColor Cyan

$directories = @(
    "components",
    "islands",
    "layouts",
    "models",
    "routes",
    "utils"
)

foreach ($dir in $directories) {
    Write-Host "Corrigiendo directorio: $dir" -ForegroundColor Yellow
    deno run -A npm:@biomejs/biome check --write --unsafe $dir
}

Write-Host "Correcciones completadas!" -ForegroundColor Green