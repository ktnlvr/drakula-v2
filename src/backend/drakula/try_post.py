import requests

url = "http://127.0.0.1:8000/game"
params = {"game_id": "1"}
game_data = {"score": 100, "level": 5, "player": "player1"}

response = requests.post(url, params=params, json=game_data)

if response.status_code == 200:
    print("Game created successfully:", response.json())
elif response.status_code == 409:
    print("Error: Game ID already exists.")
else:
    print("Failed to create game:", response.status_code, response.text)
