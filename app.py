from flask import Flask, request, session, jsonify, render_template
import random

app = Flask(__name__)
app.secret_key = "supersecretkey"

difficulty_levels = {
    "easy": 10,
    "medium": 7,
    "hard": 5
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/start", methods=["POST"])
def start_game():
    data = request.json
    difficulty = data.get("difficulty", "medium")
    
    if difficulty not in difficulty_levels:
        return jsonify({"error": "Invalid difficulty level"}), 400
    
    session["answer"] = random.randint(1, 100)
    session["low"] = 1
    session["high"] = 100
    session["attempts"] = difficulty_levels[difficulty]
    
    return jsonify({
        "message": "Game started!",
        "hint": "Guess a number between 1 and 100",
        "range": [session["low"], session["high"]],
        "attempts": session["attempts"]
    })

@app.route("/guess", methods=["POST"])
def guess_number():
    if "answer" not in session:
        return jsonify({"error": "Game not started. Please start a new game."}), 400
    
    data = request.json
    guess = data.get("guess")
    
    if not isinstance(guess, int) or guess < session["low"] or guess > session["high"]:
        return jsonify({"error": "Invalid guess. Guess a number between {} and {}".format(session["low"], session["high"])})
    
    session["attempts"] -= 1
    answer = session["answer"]
    
    if guess == answer:
        session.clear()
        return jsonify({"message": "Correct! You win!"})
    
    if guess < answer:
        session["low"] = guess + 1
    else:
        session["high"] = guess - 1
    
    if session["attempts"] <= 0:
        session.clear()
        return jsonify({"message": "Game over! The correct number was {}.".format(answer)})
    
    return jsonify({
        "message": "Try again!",
        "hint": "Guess a number between {} and {}".format(session["low"], session["high"]),
        "range": [session["low"], session["high"]],
        "attempts_left": session["attempts"]
    })

if __name__ == "__main__":
    app.run(debug=True)