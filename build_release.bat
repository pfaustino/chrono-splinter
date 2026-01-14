@echo off
set RELEASE_DIR=release
set ZIP_NAME=Chrono-Splinter.zip

echo 🚀 Starting Build Process...

if exist %RELEASE_DIR% (
    echo 🧹 Cleaning previous build...
    rmdir /s /q %RELEASE_DIR%
)
mkdir %RELEASE_DIR%

echo 📂 Copying files...
xcopy /E /I /Y assets %RELEASE_DIR%\assets
xcopy /E /I /Y css %RELEASE_DIR%\css
xcopy /E /I /Y js %RELEASE_DIR%\js
copy index.html %RELEASE_DIR%\

echo 📦 Zipping files to %ZIP_NAME%...
if exist %ZIP_NAME% del %ZIP_NAME%
powershell.exe -nologo -noprofile -ExecutionPolicy Bypass -command "& { Compress-Archive -Path '%RELEASE_DIR%\*' -DestinationPath '%ZIP_NAME%' -Force }"

echo ✅ Build Complete!
echo 📁 Release folder: %RELEASE_DIR%
echo 📦 Zip file: %ZIP_NAME%
echo.
echo Ready to upload with Butler!
pause
