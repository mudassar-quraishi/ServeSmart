@echo off
title ServeSmart Project Structure Generator
color 0A

echo ============================================
echo      ServeSmart Structure Generator
echo ============================================
echo.

REM =====================================================
REM Backend Package Root
REM =====================================================

set BACKEND=backend\src\main\java\com\servesmart

REM Change this to com\servesmart after renaming package.

echo Creating Backend Modules...
echo.

for %%M in (
auth
order
billing
inventory
employee
customer
menu
table
kitchen
supplier
notification
feedback
report
common
config
) do (

mkdir "%BACKEND%\%%M"

mkdir "%BACKEND%\%%M\controller"
mkdir "%BACKEND%\%%M\service"
mkdir "%BACKEND%\%%M\repository"
mkdir "%BACKEND%\%%M\dto"
mkdir "%BACKEND%\%%M\entity"
mkdir "%BACKEND%\%%M\mapper"
mkdir "%BACKEND%\%%M\validator"
mkdir "%BACKEND%\%%M\exception"

)

echo Backend Packages Created.
echo.

REM =====================================================
REM Resources
REM =====================================================

mkdir backend\src\main\resources\db
mkdir backend\src\main\resources\db\migration

type nul > backend\src\main\resources\application-local.properties.example

echo Resources Created.
echo.

REM =====================================================
REM Frontend Structure
REM =====================================================

echo Creating Frontend Structure...
echo.

mkdir frontend\src\assets
mkdir frontend\src\common
mkdir frontend\src\components
mkdir frontend\src\constants
mkdir frontend\src\contexts
mkdir frontend\src\hooks
mkdir frontend\src\layouts
mkdir frontend\src\router
mkdir frontend\src\services
mkdir frontend\src\styles
mkdir frontend\src\utils
mkdir frontend\src\modules

for %%M in (
auth
employee
customer
menu
table
order
billing
inventory
supplier
notification
kitchen
feedback
report
dashboard
) do (

mkdir frontend\src\modules\%%M

mkdir frontend\src\modules\%%M\pages
mkdir frontend\src\modules\%%M\components
mkdir frontend\src\modules\%%M\hooks
mkdir frontend\src\modules\%%M\services
mkdir frontend\src\modules\%%M\styles

)

echo Frontend Structure Created.
echo.

REM =====================================================
REM Documentation
REM =====================================================

mkdir docs

type nul > docs\SRS.md
type nul > docs\API_SPECIFICATION.md
type nul > docs\DATABASE_SCHEMA.md
type nul > docs\TEAM_ALLOCATION.md
type nul > docs\LOW_LEVEL_DESIGN.md
type nul > docs\ER_DIAGRAM.md
type nul > docs\CONTRIBUTING.md

echo Documentation Created.
echo.

REM =====================================================
REM Database
REM =====================================================

mkdir database

type nul > database\seed.sql
type nul > database\data.sql

echo Database Folder Created.
echo.

REM =====================================================
REM Postman
REM =====================================================

mkdir postman

type nul > postman\ServeSmart.postman_collection.json

echo Postman Folder Created.
echo.

REM =====================================================
REM GitHub
REM =====================================================

mkdir .github
mkdir .github\workflows

echo GitHub Folder Created.
echo.

echo ============================================
echo        Project Structure Completed
echo ============================================

echo.

tree /F

pause