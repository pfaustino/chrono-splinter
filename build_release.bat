@echo off
setlocal
set RELEASE_DIR=release
set ZIP_NAME=Chrono-Splinter.zip

echo.
echo  The Chrono-Splinter - release build
echo  Full checklist: RELEASE.md
echo.

if exist %RELEASE_DIR% (
    echo Cleaning previous build...
    rmdir /s /q %RELEASE_DIR%
)
mkdir %RELEASE_DIR%

echo Copying files...
xcopy /E /I /Y assets %RELEASE_DIR%\assets >nul
xcopy /E /I /Y css %RELEASE_DIR%\css >nul
xcopy /E /I /Y js %RELEASE_DIR%\js >nul
copy /Y index.html %RELEASE_DIR%\ >nul

for /f "tokens=3 delims='" %%V in ('findstr /C:"VERSION:" js\constants.js') do set GAME_VERSION=%%V
echo.
echo  Version in build: %GAME_VERSION%
for /f %%C in ('dir /s /b %RELEASE_DIR%\* ^| find /c /v ""') do set FILE_COUNT=%%C
echo  Files in release: %FILE_COUNT%  (expect ~56; 100+ means a bad/nested copy)
echo.

echo Zipping to %ZIP_NAME%...
if exist %ZIP_NAME% del %ZIP_NAME%
powershell.exe -nologo -noprofile -ExecutionPolicy Bypass -command "& { Push-Location '%RELEASE_DIR%'; Compress-Archive -Path * -DestinationPath '..\%ZIP_NAME%' -Force; Pop-Location }"

echo.
echo  Build complete: %RELEASE_DIR%\
echo.
echo  Next steps (see RELEASE.md):
echo    butler push release pfaustino/chrono-splinter:html5 --userversion %GAME_VERSION%
echo    itch.io - Edit game - Uploads: enable new HTML5, delete old uploads
echo.
pause
