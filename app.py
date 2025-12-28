from flask import Flask,request,jsonify
from flask_cors import CORS

app=Flask(__name__)
CORS(app)

@app.route("/check",methods=["POST"])
def check():
    d=request.json
    age=int(d["age"])
    income=int(d["income"])
    lang=d["lang"]

    if age<=35 and income<=60000:
        msg={
        "en":"You are eligible for Youth Skill Development Scheme",
        "hi":"आप युवा कौशल विकास योजना के लिए पात्र हैं",
        "gu":"તમે યુથ સ્કિલ ડેવલપમેન્ટ યોજના માટે પાત્ર છો"
        }
        return jsonify({"message":msg[lang],"eligible":True})
    else:
        msg={
        "en":"No suitable scheme found",
        "hi":"कोई उपयुक्त योजना नहीं मिली",
        "gu":"કોઈ યોગ્ય યોજના મળી નથી"
        }
        return jsonify({"message":msg[lang],"eligible":False})

if __name__=="__main__":
    app.run(debug=True)
