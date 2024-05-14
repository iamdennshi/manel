Create venv
py -m venv env

Activate
.\env\Scripts\activate

Install dependencies
pip install -r requirements.txt

Start
uvicorn main:app --reload --host 0.0.0.0
