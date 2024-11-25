import requests
import json

def post_game(url, game_id, game_data):
    endpoint = f"{url}/game"
    headers = {'Content-Type': 'application/json'}
    params = {"game_id": game_id} 
    response = requests.post(endpoint, headers=headers, params=params, data=json.dumps(game_data))
    handle_response(response)
    return response

def get_game(url, game_id):
    endpoint = f"{url}/game"
    params = {"game_id": game_id}
    response = requests.get(endpoint, params=params)
    handle_response(response)
    return response

def get_airports(url, seed=None, amount=15):

    params = {
        "seed": seed,
        "amount": amount
    }
    endpoint = f"{url}/airports"
    response = requests.get(endpoint, params=params)
    handle_response(response)
    return response

def handle_response(response):
    if response.status_code == 202:
        print("Request accepted but not yet processed (202 Accepted).")
    elif response.status_code == 404:
        print("Resource not found (404 Not Found).")
    elif response.status_code == 400:
        print("Bad request (400 Bad Request).")
    elif response.status_code == 409:
        print("Conflict (409 Conflict).")
    elif response.status_code == 500:
        print("Internal server error (500 Internal Server Error).")
    else:
        print(f"Response status code: {response.status_code}")

if __name__ == "__main__":
    base_url = "http://127.0.0.1:8000"
    
    game_id = 1234
    game_data = {
        "name": "Drakula Adventure",
        "genre": "Horror",
        "platform": "PC",
        "release_year": 2024
    }
    
    post_response = post_game(base_url, game_id, game_data)
    print(f"POST Response: {post_response.status_code}")
    if post_response.status_code == 201:
        print(post_response.json())
    
    get_response = get_game(base_url, game_id)
    print(f"GET Response: {get_response.status_code}")
    if get_response.status_code == 200:
        print(get_response.json())

    get_airports_response = get_airports(base_url, seed="example_seed", amount=10)
    print(f"GET Airports Response: {get_airports_response.status_code}")
    if get_airports_response.status_code == 200:
        print(get_airports_response.json())
