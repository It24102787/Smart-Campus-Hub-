$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot
$env:MAVEN_USER_HOME = Join-Path $PSScriptRoot ".m2"

if (-not (Test-Path $env:MAVEN_USER_HOME)) {
  New-Item -Path $env:MAVEN_USER_HOME -ItemType Directory | Out-Null
}

Write-Host "Using MAVEN_USER_HOME: $env:MAVEN_USER_HOME"

if (-not $env:MYSQL_URL) {
  $env:MYSQL_URL = "jdbc:mysql://localhost:3306/academic_support_portal?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
}

if (-not $env:MYSQL_USERNAME) {
  $inputUser = Read-Host "MySQL username (default: root)"
  $env:MYSQL_USERNAME = if ([string]::IsNullOrWhiteSpace($inputUser)) { "root" } else { $inputUser }
}

if (-not $env:MYSQL_PASSWORD) {
  $securePwd = Read-Host "MySQL password (leave empty if none)" -AsSecureString
  $plainPwd = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd)
  )
  $env:MYSQL_PASSWORD = $plainPwd
}

Write-Host "Starting backend with MySQL user: $($env:MYSQL_USERNAME)"
.\mvnw.cmd -DskipTests spring-boot:run
