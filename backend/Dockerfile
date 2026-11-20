FROM python:3.14.10-alpine3.24
# uid 1000 : le volume app_data existant appartient à cet uid
RUN apk add --no-cache tzdata && adduser -D -u 1000 app && mkdir /data && chown app:app /data
ENV DB_PATH=/data/work-tracking.db TZ=Europe/Paris PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY *.py ./
USER app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
