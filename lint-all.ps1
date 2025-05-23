Write-Host "Ejecutando Biome Linter en todo el proyecto..." -ForegroundColor Cyan

$directories = @(
    "components",
    "islands",
    "layouts",
    "models",
    "routes",
    "utils"
)

foreach ($dir in $directories) {
    Write-Host "Analizando directorio: $dir" -ForegroundColor Yellow
    deno run -A npm:@biomejs/biome lint --write $dir
}

Write-Host "Linting completado!" -ForegroundColor Green