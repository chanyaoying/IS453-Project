FROM python:3.9-slim-buster

# Create app directory
WORKDIR /usr/src/app/

# Install app dependencies
COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN export FLASK_APP=markowitzPortfolioTheory

# Run
EXPOSE 5005
COPY ./services/markowitzPortfolioTheory.py ./
COPY ./services/MPT_functions.py ./
COPY ./services/utility.py ./

# CMD [ "python", "markowitzPortfolioTheory.py"]
CMD [ "gunicorn", "-b", "0.0.0.0:5005", "markowitzPortfolioTheory:app", "-w", "4"]