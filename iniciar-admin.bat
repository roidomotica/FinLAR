@echo off
chcp 65001 > nul
title FinLAR — Panel de Administración Local

echo.
echo  ╔═══════════════════════════════════════════════════╗
echo  ║        FinLAR — Iniciar Panel de Administración    ║
echo  ╚═══════════════════════════════════════════════════╝
echo.

:: Verificar que Node.js está instalado
node --version > nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js no está instalado en tu ordenador.
    echo.
    echo  Para instalarlo, visita: https://nodejs.org
    echo  Descarga la versión "LTS" (la recomendada para la mayoría).
    echo  Después de instalarla, vuelve a ejecutar este archivo.
    echo.
    pause
    exit /b 1
)

echo  [OK] Node.js detectado correctamente.
echo.
echo  Iniciando servidores... (puede tardar unos segundos la primera vez)
echo.

:: Arrancar el servidor de Decap CMS (gestiona los artículos del blog)
echo  [1/2] Arrancando servidor del panel de administración...
start "FinLAR - Admin CMS" cmd /k "npx decap-server"

:: Esperar 3 segundos para que el servidor CMS inicie
timeout /t 3 /nobreak > nul

:: Arrancar el servidor web local (sirve la web en tu navegador)
echo  [2/2] Arrancando servidor web local...
start "FinLAR - Servidor Web" cmd /k "npx serve . -p 8080 --no-clipboard"

:: Esperar 2 segundos para que el servidor web inicie
timeout /t 2 /nobreak > nul

:: Abrir el panel de administración en el navegador
echo.
echo  ══════════════════════════════════════════════════════
echo   Panel de administración listo en tu navegador:
echo   http://localhost:8080/admin
echo.
echo   Web principal disponible en:
echo   http://localhost:8080
echo  ══════════════════════════════════════════════════════
echo.
echo  Para DETENER los servidores: cierra las dos ventanas
echo  de consola que se han abierto (las que dicen
echo  "FinLAR - Admin CMS" y "FinLAR - Servidor Web").
echo.

start http://localhost:8080/admin

pause
