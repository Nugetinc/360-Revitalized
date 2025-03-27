@echo off
setlocal enabledelayedexpansion

:: Set the game ID (Replace with actual Xbox 360 store ID)
set GAME_ID=1234567890

:: Fetch game metadata using PowerShell (Example API call)
powershell -Command "& {
    $url = 'https://api.example.com/game/%GAME_ID%' 
    $response = Invoke-WebRequest -Uri $url
    $data = $response.Content | ConvertFrom-Json

    # Extract necessary metadata
    $title = $data.title
    $description = $data.description
    $image = 'images/' + $data.title.ToLower() + '.png'
    $hero = 'images/' + $data.title.ToLower() + '_hero.jpg'
    $download = 'https://myrient.xyz/' + $data.title.ToLower()

    # Create the JSON structure
    $json = @{
        "title" = $title
        "description" = $description
        "image" = $image
        "hero" = $hero
        "download" = $download
    }

    # Convert to JSON and save it
    $json | ConvertTo-Json -Depth 3 | Out-File 'game_metadata.json'
}"

echo Game metadata saved to game_metadata.json
pause
