cd .\back
call .\env\Scripts\activate

uvicorn main:app --reload --host 0.0.0.0