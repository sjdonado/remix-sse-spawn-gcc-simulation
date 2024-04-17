FROM python:3.11

WORKDIR /app

RUN apt-get update && apt-get install -y patchelf
RUN pip install jupyter nuitka

COPY ev_charging_demand.ipynb ev_charging_demand.ipynb

RUN jupyter nbconvert --to script ev_charging_demand.ipynb
RUN nuitka3 --standalone --onefile ev_charging_demand.py

CMD ["./ev_charging_demand.bin"]
